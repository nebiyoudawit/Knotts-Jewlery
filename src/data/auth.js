// src/data/auth.js
export const mockUsers = [
    {
      id: 1,
      username: 'seller1',
      email: 'seller@example.com',
      password: 'seller123',
      role: 'seller',
      name: 'John Seller'
    },
    {
      id: 2,
      username: 'buyer1',
      email: 'buyer@example.com',
      password: 'buyer123',
      role: 'buyer',
      name: 'Alice Buyer'
    }
  ];
  
  export const authenticateUser = (email, password) => {
    const user = mockUsers.find(user => 
      user.email === email && user.password === password
    );
    return user || null;
  };
  
  export const registerUser = (userData) => {
    const newUser = {
      ...userData,
      id: mockUsers.length + 1,
      role: userData.role || 'buyer' // Default to buyer if not specified
    };
    mockUsers.push(newUser);
    return newUser;
  };