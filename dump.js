const fs=require('fs');
const c=fs.readFileSync('C:/Users/user/Desktop/PROJECT 1/savorbite-api/src/controllers/payment.controller.js');
const lines=c.toString().split(/\r?\n/);
for(let i=50;i<95;i++){console.log(i+1+':'+(lines[i]||''));}
