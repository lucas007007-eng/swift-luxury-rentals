# 🤖 FINAL CURSOR AGENT COMMAND (Copy-Paste Ready)

## 📋 Copy This Exact Command to Cursor Agent:

```
Hello! I need help extracting luxury property listings for my rental platform.

Repository: https://github.com/lucas007007-eng/crypto-real-estate

Instructions: Read src/data/ai-agent-input/EFFICIENT_CURSOR_AGENT_INSTRUCTIONS.md

Mission: Extract large luxury apartments (€6000+ monthly, 100m²+ size) from HousingAnywhere ONLY.

Target 6 cities:
1. Berlin: https://housinganywhere.com/s/Berlin--Germany?priceMin=600000&surfaceMin=100
2. Paris: https://housinganywhere.com/s/Paris--France?priceMin=600000&surfaceMin=100  
3. Amsterdam: https://housinganywhere.com/s/Amsterdam--Netherlands?priceMin=600000&surfaceMin=100
4. Vienna: https://housinganywhere.com/s/Vienna--Austria?priceMin=600000&surfaceMin=100
5. Barcelona: https://housinganywhere.com/s/Barcelona--Spain?priceMin=600000&surfaceMin=100
6. London: https://housinganywhere.com/s/London--United-Kingdom?priceMin=600000&surfaceMin=100

Process:
- Check each city for 12+ available luxury listings
- If city has sufficient listings: Extract 12 largest apartments with real images
- If city lacks listings: SKIP and report in summary
- ONLY use HousingAnywhere.com (no other websites)
- Extract exact titles, descriptions, amenities, and image URLs
- Update src/data/cityProperties.ts with real data
- Commit each completed city separately

Report which cities were completed vs skipped to minimize token usage.

Focus on largest apartments (150m²+ penthouses preferred) with authentic HousingAnywhere images.
```

## 🎯 Expected Agent Response:

The agent should report something like:
```
✅ Completed: Berlin (12 properties), Paris (12 properties), Amsterdam (12 properties)
⏭️ Skipped: Vienna (only 3 listings found), Barcelona (only 5 listings found), London (only 2 listings found)

Total: 36 luxury properties extracted from HousingAnywhere
All properties are 100m²+ with authentic images and €6000+ monthly pricing.
```

## 💡 Token Efficiency Features:

✅ **Single website focus** (HousingAnywhere only)
✅ **Skip logic** (don't waste tokens searching unavailable cities)  
✅ **Clear boundaries** (no random website browsing)
✅ **Structured reporting** (agent knows exactly what to report)
✅ **Pre-filtered URLs** (agent doesn't need to figure out search parameters)

This approach will get you maximum authentic luxury properties with minimal token usage! 🚀


