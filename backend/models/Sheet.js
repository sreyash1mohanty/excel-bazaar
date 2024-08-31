const mongoose = require('mongoose');

const sheetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  data: [
    [
      {
        value: { type: String, required: true,default: '' }
      }
    ]
  ]
});

module.exports = mongoose.model('Sheet', sheetSchema);
