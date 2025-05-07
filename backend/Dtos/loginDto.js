class loginDto {
    constructor(email, password) {
      this.email = email?.toLowerCase(); // Normalize email
      this.password = password; // Password
    }
  }
  
  export default loginDto;
  