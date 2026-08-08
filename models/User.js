const createUser = ({
  username,
  email,
  password
}) => ({
  username,
  email,
  password,
  createdAt: new Date()
});

module.exports = {
  createUser
};
