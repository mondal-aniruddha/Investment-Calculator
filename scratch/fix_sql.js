const fs = require('fs');
const path = 'backend/src/main/resources/db/migration/V6__learn_hub_and_glossary.sql';
let text = fs.readFileSync(path, 'utf8');

// Notice common contractions that might have a single quote instead of two:
// e.g., wouldn't -> wouldn''t, don't -> don''t, isn't -> isn''t, aren't -> aren''t,
// won't -> won''t, let's -> let''s, India's -> India''s, person's -> person''s,
// Einstein's -> Einstein''s, Rahul's -> Rahul''s, Priya's -> Priya''s, Arjun's -> Arjun''s, Rohan's -> Rohan''s

// Let's replace any single quote that is surrounded by word characters:
// \b([a-zA-Z]+)'([a-zA-Z]+)\b but NOT if already ''
const fixed = text.replace(/([a-zA-Z])'([a-zA-Z])/g, (match, p1, p2) => {
    return p1 + "''" + p2;
});

// Also fix: '"" -> double quote or similar
fs.writeFileSync(path, fixed, 'utf8');
console.log('Fixed apostrophes in SQL migration file.');
