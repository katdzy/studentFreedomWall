const Filter = require('bad-words');

const filter = new Filter();

// Add custom inappropriate words
const customWords = [
  'violence', 'threat', 'harm', 'suicide', 'drug', 'illegal', 'kill'
];
filter.addWords(...customWords);

const contentFilter = (req, res, next) => {
  const { messageContent } = req.body;
  
  if (messageContent) {
    // Check for inappropriate content
    if (filter.isProfane(messageContent)) {
      return res.status(400).json({ 
        message: 'Content contains inappropriate language and cannot be posted.' 
      });
    }
    
    // Clean the content (optional - removes profanity)
    req.body.messageContent = filter.clean(messageContent);
  }
  
  next();
};

module.exports = contentFilter;