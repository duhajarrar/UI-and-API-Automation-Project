export const accountURLRegex = /\/account$/;
export const loginURLRegex = /\/auth\/login/;

export const LOGIN_ERROR = "Invalid email or password";

// "wrong password" uses the test user's real email, so it's built inside the test.

export const rejectedByServer = [
  { id: "TC-LOGIN-02", title: "wrong password", email: "TEST_USER", password: "WrongPass123!" },
  { id: "TC-LOGIN-03", title: "unregistered email", email: "not-registered-qa@example.com", password: "AnyPass123!" },
];


export const rejectedByForm = [
  { id: "TC-LOGIN-04", title: "empty email", email: "", password: "AnyPass123!", field: "email", message: "Email is required" },
  { id: "TC-LOGIN-05", title: "email without @", email: "not-an-email", password: "AnyPass123!", field: "email", message: "Email format is invalid" },
  { id: "TC-LOGIN-06", title: "empty password", email: "someone@example.com", password: "", field: "password", message: "Password is required" },
];