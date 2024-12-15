# **ZKPass - Freelancer.com Corprate Verification**

## **Data Source Name**  
**Freelancer.com**  
Freelancer.com is one of the world’s largest freelancing platforms, connecting professionals with clients across various industries. This integration enables the verification of a user's profile type, specifically checking whether the profile is a **corporate** account, ensuring it is a verified business entity on the platform.


## **API Endpoint URL**  
**Endpoint**: [https://www.freelancer.com/ajax-api/navigation/user-info.php](https://www.freelancer.com/ajax-api/navigation/user-info.php)

**Example Response**
```json
{
    "status": "success",
    "isValidAgainstSchema": true,
    "result": {
        "id": "80963992",
        "username": "LeoFranklin015",
        "publicName": "Leo F.",
        "isCorporate": false,
        "isFreeTrialEligible": true,
        "isPlusTrialEligible": true,
        "trialPackageId": 5,
        "isPremium": false,
        "logo": "https:\/\/www.freelancer.com\/img\/unknown.png",
        "membership": "free member",
        "hideMembershipUpgradeButton": false,
        "trialDuration": 1,
        "trialLandingUrlParams": {
            "packageId": 5,
            "trialDuration": "month",
            "trialCycle": 1
        },
        "monthlyTrial": true,
        "canSwitchToUsers": [],
        "isNoCommissionEligibleReferrer": true
    }
}
```
### **Server Response Details**  
The endpoint returns a structured response with key data points, including:  
- result|isCorporate: Represents the profile is a corporate person or not.  
- result|username: contains the username of the profile.

---

## **Technical Breakdown**

This schema functions within the **zkPass framework** by integrating the **Freelancer.com** API to validate the profile type:

### **1. Data Retrieval:**
- The API fetches the corporate status of the user’s profile using `result|isCorporate`.

### **2. Validation Logic:**
- The schema checks whether the `isCorporate` field in the response is **true**. This ensures the user is a corporate entity, such as a company or organization, rather than an individual freelancer.

### **3. Access Control:**
- This validation is crucial for platforms that need to differentiate between individual freelancers and corporate entities for eligibility in certain roles, like **dispute resolution** or **project handling**.

### **4. Reputation System:**
- The corporate status can be integrated into a **reputation system** to offer special permissions or features to verified corporate accounts.
---

## **Schema Code**  
```json
{
  "issuer": "Freelancer.com",
  "desc": "To check you are a corporate in the freelancer.com",
  "website": "https://www.freelancer.in/dashboard",
  "APIs": [
    {
      "host": "www.freelancer.com",
      "intercept": {
        "url": "ajax-api/navigation/user-info.php",
        "method": "GET",
        "query": [
          {
            "compact": "true",
            "new_errors": "true",
            "new_pools": "true",
            "verify": true
          }
        ]
      },
      "assert": [
        {
          "key": "result|isCorporate",
          "value": "false",
          "operation": "!="
        }
      ],
      "nullifier": "result|username"
    }
  ],
  "HRCondition": [
    "To check you are a corporate profile in a freelancer.com platform"
  ],
  "tips": {
    "message": "Wait if your network is slow."
  },
  "category": "Social",
  "id": "0x68e5236410aa481f98b57c2f3e2f9c68"
}
```
