// script.js

async function saveAttendance(){

const token = localStorage.getItem("token");

const response = await fetch("https://course-planner3.onrender.com/api/attendance",{
    method:"POST",
    headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer " + token
    },
    body: JSON.stringify({
        user_id:1,
        module_id:2,
        status:"Present"
    })
});

const data = await response.json();

if(response.ok){

  alert("Attendance saved successfully");

  window.open("https://course-planner3.onrender.com/api/export-attendance");

}else{

  alert("Error saving attendance");

}
}