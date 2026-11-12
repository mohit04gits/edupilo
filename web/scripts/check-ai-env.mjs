const required=["GEMINI_API_KEY","GEMINI_MODEL","GROQ_API_KEY","GROQ_MODEL"];
const missing=required.filter(name=>!process.env[name]?.trim()||/^replace_with_/i.test(process.env[name].trim()));
if(missing.length){console.error(`[ai] Planning configuration is incomplete: ${missing.join(", ")}`);process.exitCode=1}else console.log("[ai] Gemini creator and Groq reviewer configuration is ready");
