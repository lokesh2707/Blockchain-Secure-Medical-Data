# Creating an Admin Account

## Method 1: Using the Registration Page (Easiest)

1. **Navigate to Registration**
   - Go to: `http://localhost:3000/register`

2. **Fill in the Form**
   - Full Name: Your name
   - Email: Your email
   - Password: At least 8 characters
   - Confirm Password: Same as password
   - **I am a**: Select **"Admin"** from the dropdown

3. **Create Account**
   - Click "Create Account"
   - You'll be redirected to the dashboard

## Method 2: Using Direct API Call

If you prefer to create an admin via API:

```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123456",
    "role": "admin"
  }'
```

## Available Roles

The system supports 4 roles:

1. **Patient** - Can upload and manage their own medical records
2. **Doctor** - Can view records shared with them by patients
3. **Researcher** - Can view ALL medical records for research purposes
4. **Admin** - Full system access (can be extended with admin features)

## Admin Features (To Be Implemented)

Currently, admin role is available but doesn't have special features yet. You can extend it with:

- User management (view, edit, delete users)
- System statistics and analytics
- Audit logs
- Access control management
- System configuration

## Verifying Admin Account

After creating an admin account, you can verify it by:

1. **Login** at `http://localhost:3000/login`
2. **Check the dashboard** - Your role should show as "Admin"
3. **Check browser console** - Auth logs will show your role

## Security Note

⚠️ **Important**: In production, you should:
- Restrict admin registration to authorized personnel only
- Add email verification
- Implement 2FA for admin accounts
- Add admin approval workflow
- Log all admin actions

For now, anyone can register as admin through the signup form. Consider adding backend validation to restrict admin creation.
