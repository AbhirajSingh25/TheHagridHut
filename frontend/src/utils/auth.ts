export function getToken() {

  return localStorage.getItem(
    "token"
  );
}


export function getUser() {

  return JSON.parse(

    localStorage.getItem(
      "user"
    ) || "{}"
  );
}


export function logout() {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "user"
  );

  window.location.href =
    "/login";
}


export function isAuthenticated() {

  const token = getToken();

  return !!token;
}