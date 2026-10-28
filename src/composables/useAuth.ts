import { ref } from "vue";
import { ID } from "appwrite";
import { account } from "@/services/appwrite/appwrite";
import { useFavorites } from "@/composables/useFavorites";

const loggedInUser = ref<any>(null);

export function useAuth() {
  const { resetFavorites } = useFavorites();

  // Login
  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession({
      email,
      password,
    });

    loggedInUser.value = await account.get();
  };

  // Register
  const register = async (
    email: string,
    password: string,
    name: string
  ) => {
    await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });

    await login(email, password);
  };

  // Logout
  const logout = async () => {
    await account.deleteSession({
      sessionId: "current",
    });

    // Clear Local Favorites Without Deleting Appwrite Data
    resetFavorites();

    loggedInUser.value = null;
  };

  return {
    loggedInUser,
    login,
    register,
    logout,
  };
}