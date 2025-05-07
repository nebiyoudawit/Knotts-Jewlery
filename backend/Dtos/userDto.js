// userDTO.js
class userDto {
    constructor(user) {
      this._id = user._id;
      this.name = user.name;
      this.email = user.email;
      this.phone = user.phone;
      this.address = user.address;
    }
  }
  
  export default userDto;
  