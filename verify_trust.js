async function test_hierarchical_matching() {
  const resumeText = "Dilip Kohar. mahendra.harijan093@gmail.com. Skills: MySQL, Node.js, Express.js. Education: B.Tech. Role: Full Stack Developer.";
  const jobDescription = "We need a Full Stack Developer with experience in Databases and Backend Frameworks.";

  console.log("Starting Hierarchical Matching & Sanity Check Test...");

  try {
    const resp = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription })
    });
    const result = await resp.json();
    if (!result.success) throw new Error(result.error);
    
    const res = result.data;
    const foundKeywords = res.keywords.found.map(k => k.toLowerCase());
    const missingKeywords = res.keywords.missing.map(k => k.toLowerCase());

    console.log("\nFound Keywords:", res.keywords.found.join(", "));
    console.log("Missing Keywords:", res.keywords.missing.join(", "));

    const hasMySQL = foundKeywords.some(k => k.includes('mysql'));
    const missingDatabases = missingKeywords.includes('databases');
    const missingBackend = missingKeywords.includes('backend frameworks');

    if (hasMySQL && !missingDatabases && !missingBackend) {
      console.log("\n✅ SUCCESS: 'Databases' and 'Backend Frameworks' correctly credited via MySQL and Node/Express.");
    } else {
      console.log("\n❌ FAILURE: Logic still failing to recognize technology hierarchy.");
      if (missingDatabases) console.log("- 'Databases' mistakenly marked as missing.");
      if (missingBackend) console.log("- 'Backend Frameworks' mistakenly marked as missing.");
    }

    console.log(`\nOverall Score: ${res.overall_score}`);
    console.log(`Skills Alignment: ${res.scores.skills_alignment.score}`);

  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test_hierarchical_matching();
