const express = require("express");
const router = express.Router();
var md5=require("md5");
const connection=require("./db");
var md5=require("md5");
var moment = require('moment'); // require
moment().format(); 
var authorization=require("./authorization");
const fs = require("fs");
var filepath = __dirname + "/data.json";
var uuid = require("uniqid");
const uniqueId = uuid();  

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

var cookieParser = require('cookie-parser')
router.use(cookieParser());
router.use(express.static("public"));







function randomStr(len, arr) {
    let ans = '';
    for (let i = len; i > 0; i--) {
        ans +=
            arr[(Math.floor(Math.random() * arr.length))];
    }
    return ans;
}
router.get("/dashboard",authorization,(req,res)=>{
  res.render("all.ejs")
});


router.get("/dynamictable",authorization,(req,res)=>{
    res.render("dynamictable.ejs");
});

router.get("/kukucube",authorization,(req,res)=>{
    res.render("kuku_cube.ejs")
});
router.get("/tictactoe",authorization,(req,res)=>{
    res.render("tictactoe.ejs")
});
router.get("/event",authorization,(req,res)=>{
  res.render("event.ejs")
})
router.get("/sorting",authorization,(req,res)=>{
  res.render("sorting.ejs")
});




router.get("/register",async(req, res) => {

    res.render("register.ejs");
  });
  router.post("/register/:code",async(req,res)=>{
     const code=req.params.code
     console.log(code)
    fdata=req.body;
    const name=fdata.name;
    const phone=fdata.phone;

    const email=fdata.email;
    // var url=`/activate/${code}`
     connection.query(`select * from user_registration where email='${email}'`,(err,result)=>{
    console.log(result);
     let flag=true
    if(result.length>0){
      if(result[0].password!=null){
          flag=false
          // return;
      }
      if(!(result[0].password==null)){
        flag=false
      }
    
    } else{
      flag=true;
       connection.query(`insert into user_registration(name,phone,email,code) values('${name}','${phone}','${email}','${code}')`);
    }
    console.log(flag);
    res.json(flag);
   });

  });



  router.get("/thank/:code",(req,res)=>{
    
    const code=req.params.code;
    res.render("link.ejs",{code:code})
  })

router.get("/activate/:code",async(req,res)=>{
    const code=req.params.code
    console.log("code",code)
 let y=connection.query(`select created_on from user_registration where code='${code}'`,(err,result)=>{
    console.log(result)
    const myJSON = (result[0].created_on); 
   let link_duration= moment(myJSON).add(10000, 'milliseconds');
    //  console.log(myJSON)
    console.log("link_duration",link_duration)
    let now=moment();
   console.log("now",now)
   if(link_duration>now){
        res.render("password.ejs")
   }
   else{
    res.send("<h2>Sorry Link Has been expired</h2>")
   }
  
 });
 
})

router.post("/setPassword/:code",(req,res)=>{
    const code=req.params.code
    pdata=req.body;
    let salt=randomStr(4,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
    const password=pdata.password[0];
    console.log("salt",salt);
    console.log("password",password);
    const combinepassword=salt+password
    const finalpassword=md5(combinepassword);
    console.log("encrypted",finalpassword);
    var query=`update user_registration set password ='${finalpassword}', salt='${salt}' where code='${code}'`;
    connection.query(query);
    res.send("ok");
  

    
})
router.get("/login",(req,res)=>{
  res.render("login.ejs");
  // ldata=req.body;
  // console.log(ldata);

});
router.post("/login",async(req,res)=>{
  ldata=req.body;
 console.log(ldata);
 email=ldata.loginemail;
 userpassword=ldata.loginpassword;
 console.log(userpassword);

 const query = (str) => {
   return new Promise((resolve, reject) => {
     connection.query(str, (err, result) => {
       if (err) {
         reject(err);
       } else {
         resolve(result);
       }
     });
   });
 }




 let a=await query(` select * from user_registration where email='${email}'`);
 console.log(a)
 // let flag=true;
 // if(a!=""{
 //   if(a[0].password)!{

 //   }
 // })
 // let  flag=true;
 let  token;
 if(a.length==0){
   // flag=false;
     token=false;
     res.json({token})
   // return
 }
 console.log("ree",a!='')
 if(a.length>0){
   if(a[0]['password']!=""){  let z=(a[0]['salt'])
   console.log(z)
   const y=md5(z+userpassword);
   console.log(z+userpassword);
   console.log("y",y)
   console.log(a.password!=y)
   console.log("ap",a[0]['password'])
   
   if(!(a[0]['password']==y)){
     
       token=false;
       res.json({token})
       
   }//else{
   //   flag=true;
   // // }
   // flag=true;
   if(a[0]['password']==y){
     let jwtSecretKey = process.env.JWT_SECRET_KEY;
     
     token=jwt.sign({userid:a[0].id,username:a[0].name}, jwtSecretKey,{expiresIn:'1h'}) ;
     res.cookie('auth',token,{maxAge:1000*60*60*10,
     httpOnly:true}).status(200)
     res.json({token})
 }

 }
} 
// console.log("flg",flag)
console.log("token",token)
// var cookie_t = req.cookies.auth;
// console.log("cookie_t",cookie_t)
// res.json(flag);
// res.json({token});
});   
    
  
  

 

router.get("/forgetpassword",async(req,res)=>{
  res.render("forgetpassword.ejs");
});
router.post("/forgetpassword",async(req,res)=>{
  console.log(req.body);
  email=req.body.loginemail;
  console.log(email);
  flag=true;
   connection.query(`select * from user_registration where email='${email}'`,(err,result)=>{
    if(err)throw err;
    console.log(result[0]);

   if(result[0]==undefined){
     flag=false;
      // res.json(flag);
    
    }
    else{
    
      flag=true ;
    }
    res.json(flag)
    
   
  })
});
router.get("/resetpassword/:em",(req,res)=>{
  res.render("resetpassword.ejs");
});
router.post("/resetpassword/:em",(req,res)=>{
  rpdata=req.body;
  email=req.params.em
  console.log(rpdata);
  console.log(email)
  const salt=randomStr(4,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
  let combinepassword=salt+rpdata.rpassword;
  console.log(combinepassword);
  let finalpassword=md5(combinepassword);
  console.log('finalpassword',finalpassword);
  connection.query(`update user_registration set password='${finalpassword}', salt='${salt}' where email='${email}' `);
  res.send("ok");
});


const ITEMS_PER_PAGE = 10; // Adjust the number of items per page as needed

router.get(`/attendance`,authorization, (req, res) => {
    var page = parseInt(req.query.page) || 1;
    var month=(req.query.month)|| 1;
    var order = req.query.order || 'studentid';
    var dir = req.query.dir || 'asc';
    if(month==undefined){
        month=1;
    }
    if(order==undefined){
        order='studentid';
    }
    if(dir==undefined){
        dir='asc';
    }

   
    const offset = (page - 1) * ITEMS_PER_PAGE;
  if(page==undefined||page==1){
    const dataQuery = `
    SELECT
    student_master.studentid,
    student_master.firstname,
    COUNT(CASE WHEN attendance_master.attendance_status = 'P' THEN 1 ELSE NULL END) AS total_days_present,
    CONCAT(
        ROUND(
            (
                COUNT(CASE WHEN attendance_master.attendance_status = 'P' THEN 1 ELSE NULL END) * 100.0 /
                IFNULL(COUNT(DISTINCT DAY(attendance_master.date)), 1)
            ),
            2
        ),
        "%"
    ) AS percentage_present
FROM
    student_master
JOIN
    attendance_master ON student_master.studentid = attendance_master.studentid
WHERE
MONTH(attendance_master.date) = ${month}
    
GROUP BY
    student_master.studentid,
    student_master.firstname
ORDER BY
${order} ${dir.toUpperCase()} `;

    
    const countQuery = `
         SELECT COUNT(*) AS totalCount
         FROM (${dataQuery}) AS data`;

         
        
         connection.query(countQuery, (countError, countResults) => {
            if (countError) {
                console.error('Error executing count SQL query:', countError);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            const totalCount = countResults[0].totalCount;
    
            connection.query(`${dataQuery} LIMIT ${offset}, ${ITEMS_PER_PAGE}`, (error, results) => {
                if (error) {
                    console.error('Error executing data SQL query:', error);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                if (!results || results.length === 0) {
                    // Handle the case when no results are returned
                    console.log('No results found.');
                    res.status(404).send('Not Found');
                    return;
                }
    
           
                const columns = Object.keys(results[0]);
                const rows = results;
    
                // Calculate total number of pages
                const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    
                res.render('attendance.ejs', {
                    columns: columns,
                    rows: results,
                    page: page,
                    totalPages: totalPages,
                    month:month,
                    order:order,
                    dir:dir
                });
            });
        });
  }
  else{
    const dataQuery = `
    SELECT
    student_master.studentid,
    student_master.firstname,
    COUNT(CASE WHEN attendance_master.attendance_status = 'P' THEN 1 ELSE NULL END) AS total_days_present,
    CONCAT(
        ROUND(
            (
                COUNT(CASE WHEN attendance_master.attendance_status = 'P' THEN 1 ELSE NULL END) * 100.0 /
                IFNULL(COUNT(DISTINCT DAY(attendance_master.date)), 1)
            ),
            2
        ),
        "%"
    ) AS percentage_present
FROM
    student_master
JOIN
    attendance_master ON student_master.studentid = attendance_master.studentid
WHERE
MONTH(attendance_master.date) = ${month}
    
GROUP BY
    student_master.studentid,
    student_master.firstname
ORDER BY
${order} ${dir.toUpperCase()}`;


const countQuery = `
     SELECT COUNT(*) AS totalCount
     FROM (${dataQuery}) AS data`;

     
    
     connection.query(countQuery, (countError, countResults) => {
        if (countError) {
            console.error('Error executing count SQL query:', countError);
            res.status(500).send('Internal Server Error');
            return;
        }

        const totalCount = countResults[0].totalCount;

        connection.query(`${dataQuery} LIMIT ${offset}, ${ITEMS_PER_PAGE}`, (error, results) => {
            if (error) {
                console.error('Error executing data SQL query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            if (!results || results.length === 0) {
                // Handle the case when no results are returned
                console.log('No results found.');
                res.status(404).send('Not Found');
                return;
            }

            const columns = Object.keys(results[0]);
            const rows = results;

            // Calculate total number of pages
            const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

            res.render('attendance.ejs', {
                columns: columns,
                rows: results,
                page: page,
                totalPages: totalPages,
                month:month,
                order:order,
                dir:dir
            });
        });
    });
  } 
});











const pmw = (ps) => {
  return (req, res, next) => {
    const pn = parseInt(req.query.page) || 1;
    const si = (pn - 1) * ps;
    const ei = si + ps;

    req.pagination = {
      page: pn,
      limit: ps,
      si,
      ei,
    };
    next();
  };
};
// const { si, ei } = req.pagination;
router.get("/result",authorization, pmw(60), (req, res) => {
  var pid = req.query.page;

  const { si, ei } = req.pagination;

  // if ((order && field) == undefined) {
  //   order = "asc";
  //   field = "id";
  // }

  if (pid == undefined || pid == 1) {
    var sql = `select student_master.studentid,student_master.firstname,student_master.lastname,sum(result_master.theorymarks_obt) as theory_mark,sum(result_master.practicalmarks_obt) as practical_mark from student_master join result_master on student_master.studentid=result_master.studentid group by result_master.studentid,result_master.examid   ORDER BY result_master.studentid limit ${si},${60}`;
    connection.query(sql, function (err, result) {
      console.log("fgf",result.length);
      if (err) throw err; 
      res.render("result.ejs", {
        result: result,
        pid: 1,
      });
    });
  } else {
    var sql = `select student_master.studentid,student_master.firstname,student_master.lastname,sum(result_master.theorymarks_obt) as theory_mark,sum(result_master.practicalmarks_obt) as practical_mark from student_master join result_master on student_master.studentid=result_master.studentid group by result_master.studentid,result_master.examid   ORDER BY result_master.studentid limit ${si},${60}`;
    connection.query(sql, function (err, result) {
      console.log("sadas",result.length);
      if (err) throw err;
      res.render("result.ejs", {
        result: result,
        pid: pid,
      });
    });
  }
});

router.get("/report",authorization, (req, res) => {
  let key = parseInt(req.query.id);
  console.log(key);

  var sql = `select student_master.studentid,student_master.firstname,student_master.lastname,subject_master.subjectname as subjectname, result_master.theorymarks_obt as theory_mark,
        result_master.practicalmarks_obt as practical_mark 
        from result_master
        inner join student_master on student_master.studentid=result_master.studentid
        inner join exam_master on exam_master.examid=result_master.examid
        inner join subject_master on subject_master.subjectid=result_master.subjectid where student_master.studentid=${key} order by subject_master.subjectid,exam_master.examid`;
  connection.query(sql, function (err, result, key) {
    console.log(result);
    if (err) throw err;
    res.render("report.ejs", {
      result: result,
      key: 1,
    });
  });
});






// const ITEMS_PER_PAGE = 10;
router.get("/dynamicquery",authorization,(req,res)=>{
  res.render("query.ejs");
})
router.post("/executeQuery",(req,res)=>{
    var sql=req.body.query;
    var page = parseInt(req.query.page) || 1;
     
  
     
  const offset = (page - 1) * ITEMS_PER_PAGE;
//   if(page==undefined||page==1){
  
  
  
  const countQuery = `
       SELECT COUNT(*) AS totalCount
       FROM (${sql}) AS data`;
  
       
      
       connection.query(countQuery, (countError, countResults) => {
          if (countError) {
              console.error('Error executing count SQL query:', countError);
              res.status(500).send('Internal Server Error');
              return;
          }
  
          const totalCount = countResults[0].totalCount;
  
          connection.query(`${sql} LIMIT ${offset}, ${ITEMS_PER_PAGE}`, (error, result) => {
              if (error) {
                  console.error('Error executing data SQL query:', error);
                  res.status(500).send('Internal Server Error');
                  return;
              }
              if (!result || result.length === 0) {
                  // Handle the case when no results are returned
                  console.log('No results found.');
                  res.status(404).send('Not Found');
                  return;
              }
  
             
             
        
  
              const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
              res.render('queryresult.ejs', {
                 
                  data: result,
                  page: 1,
                  totalPages: totalPages,
                  sql:sql
                 
              });
          });
      });
  }

);

  router.get("/executeQuery",authorization,(req,res)=>{
    var sql=req.query.sql;
    var page = parseInt(req.query.page) || 1;
     
    const offset = (page - 1) * ITEMS_PER_PAGE;
    if(page==undefined||page==1){
       const countQuery = `
       SELECT COUNT(*) AS totalCount
       FROM (${sql}) AS data`;
  
       
      
       connection.query(countQuery, (countError, countResults) => {
          if (countError) {
              console.error('Error executing count SQL query:', countError);
              res.status(500).send('Internal Server Error');
              return;
          }
  
          const totalCount = countResults[0].totalCount;
  
          connection.query(`${sql} LIMIT ${offset}, ${ITEMS_PER_PAGE}`, (error, result) => {
              if (error) {
                  console.error('Error executing data SQL query:', error);
                  res.status(500).send('Internal Server Error');
                  return;
              }
              if (!result || result.length === 0) {
                
                  console.log('No results found.');
                  res.status(404).send('Not Found');
                  return;
              } 
           
              const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
              res.render('queryresult.ejs', {
                 
                  data: result,
                  page: 1,
                  totalPages: totalPages,
                  sql:sql
                 
              });
          });
      });
  }
  else{
  
  
  
  const countQuery = `
       SELECT COUNT(*) AS totalCount
       FROM (${sql}) AS data`;
  
       
      
       connection.query(countQuery, (countError, countResults) => {
          if (countError) {
              console.error('Error executing count SQL query:', countError);
              res.status(500).send('Internal Server Error');
              return;
          }
  
          const totalCount = countResults[0].totalCount;
  
          connection  .query(`${sql} LIMIT ${offset}, ${ITEMS_PER_PAGE}`, (error, result) => {
              if (error) {
                  console.error('Error executing data SQL query:', error);
                  res.status(500).send('Internal Server Error');
                  return;
              }
              if (!result || result.length === 0) {
                  // Handle the case when no results are returned
                  console.log('No results found.');
                  res.status(404).send('Not Found');
                  return;
              }
  
              const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
              res.render('queryresult.ejs', {
                 
                  data: result,
                  page: page,
                  totalPages: totalPages,
                  sql:sql
                 
              });
          });
      });
  }
  })





router.get('/searchtable',authorization,(req,res)=>{
  var q1=`select * from student_master limit 200`;
  connection.query(q1,(error,results)=>{
  if(error)throw error;
  const columns = Object.keys(results[0]);
  const rows = results;
  res.render('searchtable.ejs',
  {rows:results,
   columns:columns
  
  
  });
  })
    
  })
  
  router.post('/searchtable',(req,res)=>{
      var p=req.body.q;
      console.log(p);
      var y=p.replace(/(?=[$-/:-?{-~!"^_`\[\]])/gi,",");
      console.log(y);
      var t=y.split(',');
      
      console.log(t);
  
      var fname=[];
      var lname=[];
      var email=[];
      var mobile=[];
      var city=[];
      var fathername=[];
  
  
      for(let i=1;i<t.length;i++){
          if(t[i].startsWith('_')){
              val=t[i].replace('_','');
              fname.push(val);
          }
          if(t[i].startsWith('^')){
              val=t[i].replace('^','');
              lname.push(val);
          }
          if(t[i].startsWith('$')){
              val=t[i].replace('$','');
              email.push(val);
          }
          if(t[i].startsWith(';')){
              val=t[i].replace(';','');
              mobile.push(val);
          }
          if(t[i].startsWith('{')){
              val=t[i].replace('{','');
              city.push(val);
          }
          if(t[i].startsWith('}')){
              val=t[i].replace('}','');
              fathername.push(val);
          }
      }
      q1=`select * from student_master where `;
      
      if(fname.length>=1){
          for(let i=0;i<fname.length;i++){
              q1 +=` firstname like '%${fname[i]}%' or `
          }
  
         q1= q1.slice(0,q1.length-3) + 'and';
      }
      // console.log(fname);
      // console.log(q1);
  
      if(lname.length>=1){
          for(let i=0;i<lname.length;i++){
              q1 +=` lastname like '%${lname[i]}%' or `
          }
  
         q1= q1.slice(0,q1.length-3) + 'and';
      }
      if(email.length>=1){
          for(let i=0;i<lname.length;i++){
              q1 +=` email like '%${email[i]}%' or `
          }
  
         q1= q1.slice(0,q1.length-3) + 'and';
      }
      if(mobile.length>=1){
          for(let i=0;i<mobile.length;i++){
              q1 +=` contact like '%${mobile[i]}%' or `
          }
  
         q1= q1.slice(0,q1.length-3) + 'and';
      }
      if(city.length>=1){
          for(let i=0;i<city.length;i++){
              q1 +=` city like '%${city[i]}%' or `
          }
  
         q1= q1.slice(0,q1.length-3) + 'and';
      }
      if(fathername.length>=1){
          for(let i=0;i<fathername.length;i++){
              q1 +=` fathername like '%${fathername[i]}%' or `
          }
  
         q1= q1.slice(0,q1.length-3) + 'and';
      }
      if(q1.includes("and",q1.length-5)  ){
          q1=q1.slice(0,q1.length-4);
      }
      if(q1.includes("or",q1.length-5)  ){
          q1=q1.slice(0,q1.length-3);
      }
      
     
  
  
     console.log(q1);
     connection.query(q1,(error,results)=>{
      if(error)throw error;
      // const columns = Object.keys(results[0]);
      if (results && results.length > 0) {
          const columns = Object.keys(results[0]);
          const rows = results;
          res.render('searchtable.ejs',
          {rows:results,
           columns:columns
          });
        } else {
          res.send("<center><h1>No match Found</h1></center>")
        }
     
      
      });
  
  
  })


  router.get("/ajaxform",authorization,(req, res) => {
    res.render("ajaxform.ejs");
  });



  router.post("/submit",(req,res)=>{
    var q = req.body;
    console.log(q);
    const fname = req.body.fname;
    const lname = req.body.lname;
    const desig = req.body.desig;
    const add = req.body.add;
    const email = req.body.email;
    const pin = req.body.pin;
    const phone = req.body.phone;
    const city = req.body.city;
    const gender = req.body.gender;
    const state = req.body.state;
    const rel_status = req.body.rel_status;
    const dob = req.body.dob;
    const refname=req.body.refname;
    const contact=req.body.refcontact;
    const relation=req.body.refrel;
  
  
    const prefloc=req.body.prefloc;
    const np=req.body.np;
    const department=req.body.department;
    const exp_ctc=req.body.exp_ctc;
    const current_ctc=req.body.current_ctc
  //  const lang_arr=req.body.language;
   language=req.body.language;
   gujarati_know=req.body.gujarati_know;
   english_know=req.body.english_know;
   hindi_know=req.body.hindi_know;
   language_know=[]
   language_know.push(hindi_know);
   language_know.push(gujarati_know);
   language_know.push(english_know);
   console.log(language,language_know);
   php_level=req.body.php_level;
   oracle_level=req.body.oracle_level;
   mysq_level=req.body.mysql_level;
   laravel_level=req.body.laravel_level;
  
   console.log(req.body)
  
  
   technology=req.body.technology;
   technology_level=[];
   technology_level.push(php_level,oracle_level,mysq_level,laravel_level);
  console.log(technology,technology_level);
  
  //  console.log(req.)
    
  
    const query = `INSERT INTO basic_details(f_name, l_name,desig,add1,email,pin,phone,city,gender,state,rel_status,dob) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
    connection.query(query, [
      fname,
      lname,
      desig,
      add,
      email,
      pin,
      phone,
      city,
      gender,
      state,
      rel_status,
      dob,
    ] ,(err,result)=>{
      if(err)throw err;
      for(let i=0;i<4;i++){
         var q2=`insert into education(emp_id,board,passing_year,percentage) values('${result.insertId}','${req.body.board[i]}','${req.body.passingyear[i]}','${req.body.per[i]}')`;
         if(req.body.board[i]){
          connection.query(q2,(err,result)=>{
            console.log(result);
           })
         }
        
        
      }
      for(let i=0;i<3;i++){
        var q3=`insert into workexp(emp_id,company,designation,from_date,to_date) values('${result.insertId}','${req.body.comp[i]}','${req.body.designation[i]}','${req.body.frm_date[i]}','${req.body.to[i]}')`;
        if(req.body.comp[i]){
          connection.query(q3,(err,result)=>{
            if(err)throw err;
            console.log(result)
          })
        }
      }
      for(let i=0;i<language.length;i++){
        var q4=`insert into language_known(emp_id,language_name,language_level) values('${result.insertId}','${language[i]}','${language_know[i]}')`;
        if(language[i]){
          connection.query(q4,(err,result)=>{
            if(err)throw err;
            console.log(result);
          })
        }
      }
      for(let i=0;i<technology.length;i++){
        var q5=`insert into technology_known(emp_id,technology,technology_level) values('${result.insertId}','${technology[i]}','${technology_level[i]}')`;
        if(technology[i]){
          connection.query(q5,(err,result)=>{
            if(err)throw err;
            console.log(result);
  
          })
        }
      }
      var q6=`insert into reference(emp_id,refname,contact,relation) values('${result.insertId}','${refname}','${contact}','${relation}')`;
      connection.query(q6,(err,result)=>{
        if(err)throw err;
        
      })
  
      var q7=`insert into preference(emp_id,prefloc,noticeperiod,department,exp_ctc,current_ctc) values('${result.insertId}','${prefloc}','${np}','${department}','${exp_ctc}','${current_ctc}')`;
      connection.query(q7,(err,result)=>{
        if(err)throw err;
        
      })
      
      
    });
    res.status(200).send('data inserted succesfully');
  });

  router.post("/updateform/:id",async(req,res)=>{
    empid=req.params.id;
    // console.log(empid)
     console.log(req.body);

    const fname1 = req.body.fname;
    const lname = req.body.lname;
    const desig = req.body.desig;
    const add = req.body.add;
    const email = req.body.email;
    const pin = req.body.pin;
    const phone = req.body.phone;
    const city = req.body.city;
    const gender = req.body.gender;
    const state = req.body.state;
    const rel_status = req.body.rel_status;
    const dob = req.body.dob;
    const refname=req.body.refname
    const refcontact=req.body.refcontact
    const refrelation=req.body.refrel
    // console.log(req.body.refrel)

    console.log(req.body.board);
    const board=req.body.board;
    const passingyear=req.body.passingyear;
    const per=req.body.per;
    const comp=req.body.comp;
    const designation=req.body.designation;
    const frm_date=req.body.frm_date;
    const to=req.body.to;
    const language =req.body.language;
    const prefloc=req.body.prefloc;
    const np=req.body.np;
    const department=req.body.department;
    const exp_ctc=req.body.exp_ctc;
    const current_ctc=req.body.current_ctc;
    
    
    if(empid){
      let query=(str)=>{
          return new Promise((resolve,reject)=>{
              connection.query(str,function(err,result){
                  if(err)throw err;
                  else {
                  resolve(result);
              }
                  
              })
          })
      }
     let q1= await query(`UPDATE basic_details set f_name = '${fname1}',l_name='${lname}',desig='${desig}',add1='${add}',email='${email}',pin='${pin}',phone='${phone}',city='${city}',
      
       gender='${gender}',state='${state}',rel_status='${rel_status}',dob='${dob}' WHERE emp_id = '${empid}'`);
      //  console.log(q3);
   let q0=await query(`select * from education where emp_id='${empid}'`)
      for(let i=0;i<board.length;i++){
        if(board[i]){
            let q2= await query(`update education set board='${board[i]}',passing_year='${passingyear[i]}',percentage='${per[i]}' where emp_id='${empid}' and 
            ed_id='${q0[i].ed_id}'`)
        }
      }

      let q3=await query(`select * from workexp where emp_id='${empid}'`);
      console.log(q3)
      console.log(q3.length);
      for(let i=0;i<q3.length;i++){
        if(comp[i]){
            await query(`update workexp set company='${comp[i]}',designation='${designation[i]}',from_date='${frm_date[i]}',to_date='${to[i]}' where emp_id='${empid}'and
            work_id='${q3[i].work_id}' `)
        }
        // await query(``)
      }

      const formData = req.body; 

        // Update language known details
        if (formData.language.length > 0) {
            for (let i = 0; i < formData.language.length; i++) {
                const language = formData.language[i];
                const q4= `
                    update language_known SET language_name = '${language}',language_level = '${formData[language + '_know']}'where
                        emp_id = '${empid}'
                        and language_name = '${language}'`;

                // Execute the update query for each language known detail
              let q5=  await query(q4);
                //  await console.log(q5)
            }
        } 

        const fdata=req.body;
          for(let i=0;i<fdata.technology.length;i++){
            if(req.body.technology[i]){
              const q6=`update technology_known set technology='${fdata.technology[i]}' ,technology_level='${fdata[fdata.technology[i]+'_level']}' 
              where emp_id='${empid}' and technology='${fdata.technology[i]}'`;
              await query(q6)
            }
            
            
          }
        
        
        
    
     let q7=
      await query(`update reference set refname ='${refname}', contact='${refcontact}',relation='${refrelation}' where emp_id='${empid}'`)
     let q8=await query(`update preference set prefloc='${prefloc}',noticeperiod='${np}',department='${department}',
     exp_ctc='${exp_ctc}',current_ctc='${current_ctc}'`);
     
        
        
   }
    // res.send("helooo");
  
  });
  router.get('/getdata', async (req, res) => {
    try {
      const id = req.query.id;
  
      if (!id) {
        return res.status(400).json({ error: 'No ID provided' });
      }
  
      // Function to execute SQL queries
      const query = (str) => {
        return new Promise((resolve, reject) => {
          connection.query(str, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      };
  
      // Fetch data from different tables based on the provided ID
      const emp_det = await query(`SELECT * FROM basic_details WHERE emp_id=${id}`);
      const edu_det = await query(`SELECT * FROM education WHERE emp_id=${id}`);
      const work_exp = await query(`SELECT * FROM workexp WHERE emp_id=${id}`);
      const lang_know = await query(`SELECT * FROM language_known WHERE emp_id=${id}`);
      const tech_know = await query(`SELECT * FROM technology_known WHERE emp_id=${id}`);
      const reference = await query(`SELECT * FROM reference WHERE emp_id=${id}`);
      const preference = await query(`SELECT * FROM preference WHERE emp_id=${id}`);
  
      // Construct the response object
      const response = {
        basic_det: emp_det,
        edu_det: edu_det,
        work_exp: work_exp,
        lang_know: lang_know,
        tech_know: tech_know,
        reference: reference,
        preference: preference
      };
      // console.log(response)
  
      // Send the response
      res.json(response);
      // res.redirect("index.ejs")
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
   
  
  });
  router.get("/update",(req,res)=>{
      res.render("ajaxform.ejs");
  })

  router.get("/logout",authorization,(req,res)=>{
    res.clearCookie("auth").status(200).redirect("/login")
  })
  
  router.get("/amanhoster",authorization,(req,res)=>{
    res.render("lay2.ejs")
  })

  router.get("/hirex",authorization,(req,res)=>{
    res.render("lay3.ejs")
  })
  // router.get("/form1",(req,res)=>{
  //   res.render(".ejs")
  // })

  router.get("/fsmodulecrud",authorization, (req, res) => {
    res.render("emp5.ejs");
  });
  router.post("/fsmodulecrud",authorization, (req, res) => {
    //let data = req.body;
    //console.log(data);
  
    let data = { uniqueId, ...req.body };
    let userjson = fs.readFileSync(filepath, "utf-8");
    let users = JSON.parse(userjson);
    users.push(data);
    userjson = JSON.stringify(users);
    fs.writeFileSync(filepath, userjson, "utf-8");
    //res.send(res.render("pages/list", { users }));
    res.redirect("list");
    //res.send(res.render("pages/userdetails", { users }));
  
    console.log(uniqueId);
    console.log(data);
  });
  
  router.get("/list",authorization, (req, res) => {
    const users = require(filepath);
    res.render("list.ejs", { users });
  });
  
  router.get("/userdetail", authorization,(req, res) => {
    const users = require(filepath);
    users.forEach((user) => {
      if (user["uniqueId"] == req.query["userid"]) {
        res.render("userdetail.ejs", { user });
      }
    });
  });
  router.get("/form2",authorization,(req,res)=>{
    res.render("form2.ejs")
  });
  router.get("/form1",authorization,(req,res)=>{
    res.render("form1.ejs")
  })
  router.get("/combo",authorization,(req,res)=>{
    res.render("combobox.ejs")
  })
  router.get('/cities/:state',authorization, (req, res) => {
    const state = req.params.state;
    let cities = [];
    switch (state) {
        case 'AP':
            cities = ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Hyderabad'];
            break;
        case 'KA':
            cities = ['Bangalore', 'Mysore', 'Hubli'];
            break;
        case 'MH':
            cities = ['Mumbai', 'Pune', 'Nagpur'];
            break;
        case 'GJ':
            cities = ['Surat', 'Ahmedabad', 'valsad', 'vapi', 'vadodara', 'mehsana'];
            break;
        case 'UP':
            cities = ['Kanpur', 'Faridabad', 'Ayodhaya', 'Baliya', 'Varanasi', 'Noida'];
            break;
        default:
            cities = [];
    }
    res.json(cities);
});
  
  





module.exports=router;
