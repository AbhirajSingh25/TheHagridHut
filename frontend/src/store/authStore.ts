export function saveUser(
  user: any
) {

  localStorage.setItem(
    "hiresense_user",
    JSON.stringify(user)
  );
}


export function getUser() {

  const user =
    localStorage.getItem(
      "hiresense_user"
    );

  if (!user) {

    return null;
  }

  return JSON.parse(user);
}


export function logoutUser() {

  localStorage.removeItem(
    "hiresense_user"
  );
}


export function isAuthenticated() {

  return !!getUser();
}