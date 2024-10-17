Noderr Frontend : https://github.com/aqibhassanzeb/noderr_frontend
Noderr Backend : https://github.com/aqibhassanzeb/noderr_backend



backend .env 


# PORT=7023
# db=mongodb+srv://shehryar:5tkyyhrpq@cluster0.pqcec04.mongodb.net/nodes?retryWrites=true&w=majority&appName=Cluster0
# EMAIL=
# PASSWORD=
# JWT_SECRET=3292||stalah
# JWT_EXPIRE=30d
# JWT_COOKIE_EXPIRE=30
CLOUDINARY_CLOUD_NAME=sheriue
CLOUDINARY_API_KEY=989999976222465
CLOUDINARY_API_SECRET=S-Qkofkp7nrkekCK-bX0VQlLFTM


# DB_CONNECTION_STRING="mongodb://88.216.222.3:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.4"
MONGO_URI="mongodb://161.97.152.55:27017/noderrDatabase"
# DB_CONNECTION_STRING="mongodb+srv://saudkhantc:test1234@noderrtest.tmr4dgc.mongodb.net/"
# MONGO_URI="mongodb://185.8.107.226:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.4"
PORT=3001
REACT_APP_API_URL=https://www.noderr.xyz
JWT_SECRET=dhaskjhdgasljkhdgasjuhkldgasj
JWT_COOKIE_EXPIRE="1h"
IPN_SECRET=d+GFysAk4CLRkADFhyCgh4MjSBWGU5CD
PRIVATE_KEY=0x47c1e941c6ef2135388a31f640d51e4f1f5a145fe9b1d6f1a756652b46757f20
EMAIL=saudkhanbpk@gmail.com
PASSWORD=rxzmgtwqbzzhuboc



frontend .env 


REACT_APP_CONNECT_WALLET_ID=45fef58f3f6ccb3d8afa7b2883387d3c
REACT_APP_API_URL=https://api.noderr.xyz
# REACT_APP_API_URL=http://localhost:3001
REACT_APP_NODE_ENDPOINT=https://api.noderr.xyz
# REACT_APP_NODE_ENDPOINT=http://localhost:3001
REACT_APP_NODE_IMG_URL=https://api.noderr.xyz/public/
# REACT_APP_NODE_IMG_URL=http://localhost:3001/public/
# REACT_APP_PROJECT_ID=prj_XO727ALwrAzCmHORljUeU5Kq57EH
REACT_APP_GHOSTY_API_KEY=r4hpff4d7XD_WsMklCMjpJjKq9xuMYaU4pqvlJ7ZcV0


# To-Do List

## 1. Fix Authentication
- [ ] **Reintroduce Authentication**: Reinstate the authentication check on user connections that was removed during testing.
    - **Note:** User login works. It has been tested, but you'll need to go through the code to ensure profile data is correctly connected.

## 2. Review API Endpoints
- [ ] **Review Security**: Examine each endpoint for security vulnerabilities or incorrect logic.
- [ ] **Implement Security Measures**: Add security features where necessary (e.g., authentication, authorization, data validation).

## 3. Code Cleanup
- [ ] **Remove Unnecessary Code**: Delete unused or commented-out code that is no longer needed.
- [ ] **Optimize Code**: Check for redundant logic or performance bottlenecks and optimize where possible.

## 4. Testing and Validation
- [ ] **Unit Testing**: Create or update unit tests to cover the new or modified code.
- [ ] **Integration Testing**: Test the interaction between different parts of the system to ensure they work together.
- [ ] **User Testing**: Conduct user testing to ensure the system behaves as expected and provides a good user experience.

DONE 
- Auto Deploy 
Test Auto Deploy
