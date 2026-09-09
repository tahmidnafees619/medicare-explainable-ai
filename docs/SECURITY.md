# MediCare AI Security Documentation

## Database Security Status ✅

### What's Currently Secure

#### 1. **Password Hashing** ✅ IMPLEMENTED
- **Algorithm**: bcryptjs with 10 salt rounds
- **Standard**: Industry-standard, resistant to brute-force attacks
- **Implementation**: All passwords are hashed before storing in database
- **Verification**: Uses bcrypt.compare to safely verify passwords (timing attack resistant)

```typescript
// Example: Password hashing during registration
const passwordHash = await hashPassword(password); // Uses bcryptjs
const user = await prisma.user.create({
  data: {
    email,
    name,
    passwordHash, // Only hash is stored, never plaintext
  }
});
```

#### 2. **User Authentication** ✅ IMPLEMENTED
- **JWT Tokens**: Secure session management with 7-day expiration
- **Authorization Middleware**: Protects all protected endpoints
- **Token Validation**: Every request verified via Bearer token

```typescript
// Example: Protected endpoint
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  // Only authenticated users can access
  const userId = req.userId!; // Guaranteed to exist after authMiddleware
});
```

#### 3. **Data Integrity** ✅ IMPLEMENTED
- **Unique Constraints**: Email addresses are unique (prevents duplicate accounts)
- **Cascade Delete**: User deletion automatically removes related data
- **Relational Integrity**: Foreign key constraints prevent orphaned records

#### 4. **Rate Limiting** ✅ IMPLEMENTED
- **Auth Endpoints**: Max 5 login/register attempts per 15 minutes per IP
- **General Endpoints**: Max 100 requests per 15 minutes per IP
- **Protection**: Prevents brute-force attacks and DDoS

#### 5. **Input Validation** ✅ IMPLEMENTED
- **Email Format**: Validated against regex pattern
- **Password Length**: Minimum 8 characters required
- **Name Length**: 2-100 characters enforced
- **Request Size**: Limited to 10MB to prevent payload attacks

#### 6. **Security Headers** ✅ IMPLEMENTED
```
X-Content-Type-Options: nosniff          # Prevent MIME sniffing
X-Frame-Options: DENY                    # Prevent clickjacking
X-XSS-Protection: 1; mode=block         # XSS protection
Strict-Transport-Security: max-age=     # HSTS (enforces HTTPS)
Content-Security-Policy: default-src    # CSP policy
```

#### 7. **CORS Protection** ✅ IMPLEMENTED
- **Whitelist**: Only allowed origins can access API
- **Development**: `localhost:5173` and `localhost:3000`
- **Production**: Configure via `ALLOWED_ORIGINS` environment variable

---

## What Needs Attention ⚠️

### 1. **JWT Secret - CRITICAL**
**Current Status**: Default value (NOT SECURE FOR PRODUCTION)

**Fix for Production**:
```bash
# Generate a strong random JWT secret
openssl rand -base64 32

# Set in .env.production
JWT_SECRET=your-generated-random-string
```

**Impact**: Without strong JWT secret, attackers could forge tokens and access any user's account.

### 2. **Database Credentials**
**Current Status**: Hardcoded in .env.local (acceptable for development only)

**Production Fix**:
- Use AWS Secrets Manager, Azure Key Vault, or similar
- Never commit credentials to git
- Use `.env.production` with placeholder, secret stored separately
- Example: `DATABASE_URL=postgresql://user:${DB_PASSWORD}@db-host:5432/medicare_ai`

### 3. **HTTPS/TLS**
**Current Status**: Development uses HTTP

**Production Requirements**:
- Install SSL certificate (use Let's Encrypt for free)
- Force HTTPS redirect
- Enable HSTS (security header already configured)

### 4. **SQL Injection**
**Current Status**: ✅ PROTECTED
- Prisma ORM uses parameterized queries automatically
- No direct SQL construction from user input

### 5. **CORS**
**Current Status**: ✅ RESTRICTED
- Currently allows `localhost:5173` and `localhost:3000`
- **Production Fix**: Update `ALLOWED_ORIGINS` to your actual domain only

---

## Security Checklist for Production Deployment

- [ ] **Change JWT Secret** - Run `openssl rand -base64 32` and update `.env.production`
- [ ] **Use HTTPS** - Install SSL certificate and configure reverse proxy
- [ ] **Update CORS** - Set `ALLOWED_ORIGINS` to your production domain(s)
- [ ] **Database Security**:
  - [ ] Use managed database (AWS RDS, Google Cloud SQL)
  - [ ] Enable Transparent Data Encryption (TDE)
  - [ ] Use strong password (20+ characters with mixed case, numbers, symbols)
  - [ ] Enable encryption at rest
  - [ ] Enable backups
  - [ ] Restrict database access to backend IPs only
  - [ ] Enable audit logging
- [ ] **Secrets Management** - Use AWS Secrets Manager or similar
- [ ] **Environment Variables** - Never commit `.env.production` with real secrets
- [ ] **API Rate Limiting** - Current limits fine, adjust if needed
- [ ] **Logging** - Set `VITE_LOG_LEVEL=info` (not debug) in production
- [ ] **OWASP Top 10** - Run security audit tools
- [ ] **Dependencies** - Keep npm packages updated: `npm audit fix --force`
- [ ] **Monitoring** - Set up error logging and alerting (Sentry, LogRocket)
- [ ] **Backups** - Automated daily database backups

---

## Database Schema Security

### User Table
```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,    -- Unique constraint prevents duplicates
  name VARCHAR NOT NULL,
  passwordHash VARCHAR NOT NULL,    -- Never store plaintext passwords
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
);
```

**No sensitive health data stored here** ✅
- Passwords are hashed with bcryptjs
- Only email and name are plaintext
- Health data stored separately in ChatSession table

### ChatSession Table
```sql
CREATE TABLE "ChatSession" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  symptomsFound JSON,               -- Consider Encrypting
  predictedDisease VARCHAR,         -- Consider Encrypting
  confidence INT,                   -- Confidence score (0-100)
  allPredictions JSON,              -- Multiple predictions
  explanation TEXT,                 -- AI explanation
  createdAt TIMESTAMP DEFAULT NOW()
);
```

**Patient Privacy Considerations**:
- ✅ Data is linked only to user ID
- ✅ Each session encrypted (use TLS for transport)
- ✅ Consider HIPAA compliance if handling US medical data
- ⚠️ No field-level encryption (consider adding for healthcare use)

### Reminder Table
```sql
CREATE TABLE "Reminder" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  medicineName VARCHAR,
  dosage VARCHAR,
  frequency VARCHAR,
  scheduledTime TIME,
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  isDone BOOLEAN DEFAULT FALSE
);
```

**Medicine Data Protection**:
- ✅ Linked to user via userId
- ✅ No sensitive pharmacy information stored
- ⚠️ Consider adding encryption for HIPAA compliance

---

## Compliance Considerations

### GDPR (If serving EU users)
- [ ] Add cookie consent banner
- [ ] Implement data export endpoint
- [ ] Implement data deletion endpoint (consider archiving instead)
- [ ] Add privacy policy
- [ ] Document data processing terms

### HIPAA (If handling US medical data)
- [ ] Enable field-level encryption
- [ ] Implement audit logging
- [ ] Business Associate Agreement (BAA) with database provider
- [ ] Implement access controls
- [ ] Data retention policies
- [ ] Incident response plan

### HITECH Act
- [ ] Breach notification procedures
- [ ] Data minimization (only collect necessary data)
- [ ] Risk assessment documentation

---

## Recommended Security Tools

1. **Dependency Security**
   ```bash
   npm audit              # Check for vulnerabilities
   npm update             # Update packages
   npm install -D snyk    # Advanced vulnerability scanning
   ```

2. **Code Security Scanning**
   - SonarQube - Code quality and security
   - Snyk - Dependency vulnerabilities
   - GitHub Advanced Security - Built-in scanning

3. **Runtime Protection**
   - Sentry - Error tracking and monitoring
   - New Relic - Performance and security monitoring

4. **Database Security**
   - AWS RDS - Managed database with built-in security
   - AWS Secrets Manager - Secure credential storage
   - CloudFlare - DDoS protection and WAF

---

## Incident Response Plan

**If Database is Compromised**:
1. Immediately rotate JWT_SECRET in all environments
2. Force all active sessions to re-authenticate
3. Review access logs for suspicious activity
4. Notify all affected users
5. Reset all user passwords
6. Enable multi-factor authentication (MFA)
7. Conduct security audit

---

## Security Contact

For security issues, **DO NOT** open public GitHub issues. Instead:
- Email: security@yourmedicalai.com
- 48-hour response time commitment
- Responsible disclosure appreciated

---

**Last Updated**: April 12, 2026
**Status**: Development ✅ | Production Ready: Add items from checklist above
