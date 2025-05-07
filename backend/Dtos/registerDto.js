// backend/dtos/RegisterDTO.js
class registerDto {
    constructor(name, email, password, address, phone) {
      this.name = name;
      this.email = email;
      this.password = password;
      this.address = address;
      this.phone = phone || '';  // phone is optional
    }
}
  export default registerDto;
  