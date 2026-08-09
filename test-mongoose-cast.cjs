const mongoose = require('mongoose');
try {
  console.log(new mongoose.Types.ObjectId('645be292415bd0536c051a66 '));
} catch (e) {
  console.log("Error:", e.message);
}
