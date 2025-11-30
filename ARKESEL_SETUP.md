# Quick Setup for Arkesel

## Your Arkesel Credentials:
- API Key: RENXaFV1WXlveHhyTXloUlNBTVU
- You need a Sender ID (e.g., "YourApp", "YourBrand", or "CompanyName")

## Steps to Configure:

1. Open your `.env` file
2. Find these lines and update them:

```bash
# Change SMS provider to arkesel
SMS_PROVIDER=arkesel

# Add your Arkesel credentials
ARKESEL_API_KEY=RENXaFV1WXlveHhyTXloUlNBTVU
ARKESEL_SENDER_ID=YourSenderID    # <-- Replace with your sender ID
```

3. **Important:** Replace `YourSenderID` with your actual registered sender ID from Arkesel

4. Save the file

5. **Rebuild the project** (since we updated the code):
```bash
npm run build
```

6. **Restart the server:**
   - Stop current server: Ctrl+C
   - Start again: `npm run dev`

7. **Test it:**
```bash
curl -X POST http://localhost:9090/api/sms/send -H "Content-Type: application/json" -d "{\"to\": \"233XXXXXXXXX\", \"message\": \"Test from BlazeSend with Arkesel!\"}"
```

## What Changed:
- Updated Arkesel provider to use the correct API format (query parameters)
- Now uses: `https://sms.arkesel.com/sms/api?action=send-sms&...`
- This matches your API documentation exactly

## Check Your Balance:
After configuration, you can test if your API key works by checking your balance:
```bash
curl "https://sms.arkesel.com/sms/api?action=check-balance&api_key=RENXaFV1WXlveHhyTXloUlNBTVU&response=json"
```
