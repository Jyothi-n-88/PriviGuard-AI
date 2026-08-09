function parseRetention(retention: string) {
  let retentionPoints = 0;
  let retentionTitle = '';
  let retentionReason = '';
  let retentionRecommendation = '';
  let retentionSeverity = 'low';

  retention = (retention || '').toLowerCase().trim();

  if (!retention || retention === 'unknown' || retention === 'unspecified' || retention === 'n/a') {
    retentionPoints = 8;
    retentionTitle = 'Undefined Data Retention';
    retentionReason = 'The assessment does not define a specific endpoint for retaining personal data.';
    retentionRecommendation = 'Define a documented retention period and implement automated deletion or anonymization controls.';
    retentionSeverity = 'high';
  } else {
    const indefiniteKeywords = ['indefinite', 'forever', 'permanent', 'no limit'];
    const isIndefinite = indefiniteKeywords.some(kw => retention.includes(kw));

    if (isIndefinite) {
      retentionPoints = 10;
      retentionTitle = 'Indefinite Data Retention';
      retentionReason = 'The assessment indicates an indefinite or permanent data retention period.';
      retentionRecommendation = 'Define a specific, justifiable retention period and implement automated data deletion/anonymization mechanisms.';
      retentionSeverity = 'high';
    } else {
      const numMap: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      let years: number | null = null;
      const yearMatch = retention.match(/(\d+)\s*year/);
      if (yearMatch) {
        years = parseInt(yearMatch[1], 10);
      } else {
        const words = retention.split(/[\s-]+/);
        for (let i = 0; i < words.length; i++) {
          if (words[i].startsWith('year')) {
            if (i > 0) {
              const prevWord = words[i-1];
              if (numMap[prevWord]) years = numMap[prevWord];
            }
          }
        }
      }
      
      if (years === null) {
        const monthMatch = retention.match(/(\d+)\s*month/);
        if (monthMatch) years = parseInt(monthMatch[1], 10) / 12;
      }
      
      if (years !== null) {
        if (years > 5) {
          retentionPoints = 7;
          retentionTitle = 'Extended Data Retention';
          retentionReason = `The assessment specifies a retention period of ${years} year(s). Extended retention increases the period during which personal data remains exposed to unauthorized access, misuse, or unnecessary processing.`;
          retentionRecommendation = 'Document the business or legal justification for the retention period and periodically review whether the data can be deleted, anonymized, or retained for a shorter period.';
          retentionSeverity = 'medium';
        } else if (years >= 3) {
          retentionPoints = 4;
          retentionTitle = 'Moderate Data Retention';
          retentionReason = `The assessment specifies a retention period of ${years} year(s).`;
          retentionRecommendation = 'Ensure that the retention period is legally or operationally justified and enforced.';
          retentionSeverity = 'low';
        } else if (years >= 1) {
          retentionPoints = 1;
          retentionTitle = 'Standard Data Retention';
          retentionReason = `The assessment specifies a retention period of ${years} year(s).`;
          retentionRecommendation = 'Ensure retention limits are enforced via automated deletion.';
          retentionSeverity = 'low';
        }
      }
    }
  }

  return { retentionPoints, retentionTitle, retentionReason };
}

console.log("1 year after employment ends", parseRetention("1 year after employment ends"));
console.log("5 years after employment ends", parseRetention("5 years after employment ends"));
console.log("Indefinite", parseRetention("Indefinite"));
console.log("Unknown", parseRetention("Unknown"));

