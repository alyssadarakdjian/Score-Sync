export const base44 = {
  auth: {
    me: async () => ({
      full_name: "Demo User",
      email: "demo@example.com",
    }),
    logout: () => {
      localStorage.clear();
      window.location.href = "/";
    },
  },
};