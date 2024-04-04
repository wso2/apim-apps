const predefinedAnswers = {
    hi: 'Hello there!, How can I assist you today?',
    hiii: 'Hello there!, How can I assist you today?',
    hello: 'Hi! How can I assist you today?',
    hey: 'Hey! How can I help you?',
    greetings: 'Greetings! What can I assist you with?',
    thanks: 'You\'re welcome!',
    bye: 'Goodbye! Have a great day!',
    goodbye: 'Goodbye! Have a great day!',
    'thank you': 'You\'re welcome!',
    'thank you for your help': 'You\'re welcome!',
    'good morning': 'Good morning! How can I assist you today?',
    'good afternoon': 'Good afternoon! What can I do for you?',
    'good evening': 'Good evening! How can I help?',
    'hey there': 'Hey! What can I assist you with?',
    'hi there': 'Hello! How may I assist you?',
    'hello there': 'Hello! How can I assist you today?',
    'how are you': 'I\'m doing well, thank you! How can I help you?',
    'can you help me': 'You can ask me anything related to APIs!',
    'what can I ask you': 'You can ask me anything related to APIs!',
    'what can you do': 'I can help you with finding APIs and providing information related to APIs.',
    'what do you do': 'I can help you with finding APIs and providing information related to APIs.',
    'what do you know': 'I know a lot about APIs! What are you looking for?',
    'what are you': 'I am the Marketplace Assistant. I can help you with finding APIs and providing information related to APIs.',
    'who are you': 'I am the Marketplace Assistant. I can help you with finding APIs and providing information related to APIs.',
    'what is your name': 'I am the Marketplace Assistant. I can help you with finding APIs and providing information related to APIs.',
};

const calculateStringSimilarity = (string1, string2) => {
    const str1 = string1.toLowerCase();
    const str2 = string2.toLowerCase();

    if (str1.length < 2 || str2.length < 2) return 0;

    const subsequenceMap = new Map();
    for (let i = 0; i < str1.length - 1; i++) {
        const subsequence = str1.substr(i, 2);
        subsequenceMap.set(subsequence, subsequenceMap.has(subsequence) ? subsequenceMap.get(subsequence) + 1 : 1);
    }

    let matchCount = 0;
    for (let j = 0; j < str2.length - 1; j++) {
        const subsequence = str2.substr(j, 2);
        const count = subsequenceMap.has(subsequence) ? subsequenceMap.get(subsequence) : 0;
        if (count > 0) {
            subsequenceMap.set(subsequence, count - 1);
            matchCount++;
        }
    }

    return (matchCount * 2) / (str1.length + str2.length - 2);
};

const findBestMatchingAnswer = (inputString) => {
    let bestMatch = null;
    let bestScore = -1;

    const searchString = inputString.toLowerCase();

    if (searchString.length < 2) return null;

    for (const [key] of Object.entries(predefinedAnswers)) {
        const comparisonString = key.toLowerCase();

        const score = calculateStringSimilarity(searchString, comparisonString);

        if (score > bestScore) {
            bestScore = score;
            bestMatch = key;
        }
    }

    if (bestScore < 0.8) return null;

    return predefinedAnswers[bestMatch];
};

export default findBestMatchingAnswer;
