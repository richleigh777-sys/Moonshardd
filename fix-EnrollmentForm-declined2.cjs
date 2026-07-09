const fs = require('fs');
let code = fs.readFileSync('components/forms/EnrollmentFormV2.tsx', 'utf8');

code = code.replace(/<CheckCircle2 className="text-emerald-500" size={48} \/>/,
    `{lastOrder.status === 'Declined' ? (
                            <XCircle className="text-red-500" size={48} />
                         ) : (
                            <CheckCircle2 className="text-emerald-500" size={48} />
                         )}`);

code = code.replace(/<div className="w-24 h-24 bg-emerald-500\/10 rounded-full flex items-center justify-center mx-auto mb-6">/,
    `<div className={\`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 \${lastOrder.status === 'Declined' ? 'bg-red-500/10' : 'bg-emerald-500/10'}\`}>`);

code = code.replace(/const compliments = \[[\s\S]*?\];/, 
    `const compliments = lastOrder.status === 'Declined' ? [
            "Tough break, but you gave it your all!",
            "Dust it off, the next one is yours.",
            "Good effort! Let's get the next one.",
            "Can't win them all. Keep pushing!"
        ] : [
            "Outstanding performance! Another win secured.",
            "You're crushing it! Keep up the great momentum.",
            "Excellent work closing this one.",
            "Top tier effort! You're a true closer.",
            "Boom! Another one on the board.",
            "Fantastic execution. Way to seal the deal!"
        ];`);

fs.writeFileSync('components/forms/EnrollmentFormV2.tsx', code);
