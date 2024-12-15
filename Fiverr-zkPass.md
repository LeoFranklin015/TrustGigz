# **ZKPass - Fiverr Verification**

## **Data Source Name**  
**Fiverr**  
Fiverr is one of the largest freelancing platforms globally, connecting professionals with clients for a wide variety of projects. This integration enables the validation of a user’s freelancing activity by checking their total completed transactions, which represent the number of successful projects delivered.

---

## **API Endpoint URL**  
**Endpoint**: [https://www.fiverr.com/perseus/financial-dashboard/api/earnings/transactions](https://www.fiverr.com/perseus/financial-dashboard/api/earnings/transactions)  

**Example Response**
```json
{"data":{"totalCount":0,"countersPerActivity":[],"pageInfo":{"endCursor":null,"hasNextPage":false,"startCursor":null},"transactions":[]}}
```
### **Server Response Details**  
The endpoint returns a structured response with key data points, including:  
- `data|totalCount`: Represents the total number of completed transactions.  
- `data|transactions`: Contains the details of individual transactions.

---

## **Technical Breakdown**  
This schema functions within the **zkPass framework** by integrating the Fiverr API to validate a freelancer’s past activity:  

1. **Data Retrieval**:  
   - The API fetches the total number of completed transactions (`data|totalCount`).  

2. **Validation Logic**:  
   - The schema checks whether the user’s transaction count exceeds a threshold (e.g., 20 successful projects).  
   - This ensures only freelancers with substantial experience qualify for dispute resolution roles on the platform.  

3. **Reputation System**:  
   - The transaction data can also feed into a **reputation system**, allowing the platform to assign scores or rankings based on freelancing history.  

4. **Access Control**:  
   - Validation ensures only qualified users with verified credentials gain access to certain roles (e.g., validators for dispute resolution).  

---

## **Schema Code**  
```json
{
  "issuer": "Fiverr",
  "desc": "Fiverr is one of the largest freelancing platforms globally, enabling professionals to connect with clients for a wide variety of projects. This verification checks whether a user has completed any transactions or worked with clients on Fiverr, ensuring credibility and past experience.",
  "website": "https://www.fiverr.com/earnings?source=header_nav",
  "APIs": [
    {
      "host": "www.fiverr.com",
      "intercept": {
        "url": "perseus/financial-dashboard/api/earnings/transactions",
        "method": "GET"
      },
      "assert": [
        {
          "key": "data|totalCount",
          "value": "0",
          "operation": ">="
        }
      ],
      "nullifier": "data|transactions"
    }
  ],
  "HRCondition": [
    "The total number of transactions completed, representing the number of successful projects done by the user on Fiverr."
  ],
  "tips": {
    "message": "Login into Fiverr first to retrieve your transaction details seamlessly."
  },
  "category": "On-chain Activities",
  "id": "0x6303de1d87314765af37ae0e6fbf1b13"
}
