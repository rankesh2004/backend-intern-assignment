const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://rangeshcsr2004:PblVwPb1Wss46aUV@backendapi.n97h8.mongodb.net/?retryWrites=true&w=majority&appName=backendAPI', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
