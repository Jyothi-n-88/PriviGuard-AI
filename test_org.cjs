const axios = require('axios');

async function testOrg() {
  const base = 'http://127.0.0.1:3000/api';

  try {
    const ts = Date.now();
    const email = `orgtest_${ts}@test.com`;
    console.log(`Registering ${email}...`);
    await axios.post(`${base}/auth/register`, {
      organization: { name: 'Org Test LLC', industry: 'Tech' },
      user: { name: 'Org Tester', email, password: 'password123' }
    });

    const { execSync } = require('child_process');
    const out = execSync(`node -e "
      const mongoose = require('mongoose');
      require('dotenv').config();
      mongoose.connect(process.env.MONGODB_URI, { dbName: 'priviguard' }).then(async () => {
        const u = await mongoose.connection.collection('users').findOne({ email: '${email}' });
        if(!u) return;
        const crypto = require('crypto');
        for(let i=0; i<1000000; i++) {
          const otp = i.toString().padStart(6, '0');
          if (crypto.createHash('sha256').update(otp).digest('hex') === u.emailVerificationOtpHash) {
            console.log(otp);
            break;
          }
        }
        mongoose.disconnect();
      });
    "`);
    // Find the 6 digit OTP from the output
    const match = out.toString().match(/\b\d{6}\b/);
    if (!match) throw new Error('OTP not found in output');
    const otp = match[0];
    console.log(`OTP found: ${otp}`);

    console.log(`Verifying OTP...`);
    await axios.post(`${base}/auth/verify-email-otp`, { email, otp });

    console.log(`Logging in...`);
    const loginRes = await axios.post(`${base}/auth/login`, { email, password: 'password123' });
    const token = loginRes.data.data.token;
    
    console.log(`Testing Organization Fetch...`);
    const orgRes = await axios.get(`${base}/organizations/me`, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`Org name: ${orgRes.data.data.name}`);

    console.log(`Testing Organization Update...`);
    const orgUpRes = await axios.put(`${base}/organizations/me`, { description: 'A testing org' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`Org updated description: ${orgUpRes.data.data.description}`);

    console.log(`Testing Members Fetch...`);
    const membersRes = await axios.get(`${base}/organizations/me/members`, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`Total Members: ${membersRes.data.data.length} - First member role: ${membersRes.data.data[0].role}`);
    
    console.log("SUCCESS!");

  } catch (err) {
    console.error("FAILED:", err.response?.data || err.message);
  }
}
testOrg();
