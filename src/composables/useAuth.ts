import { ref } from 'vue'
import { ID } from 'appwrite'
import { account } from '@/services/appwrite/appwrite'

const loggedInUser = ref<any>(null)

export function useAuth() {
  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession({
      email,
      password,
    })

    loggedInUser.value = await account.get()
  }

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
    })

    await login(email, password)
  }

  const logout = async () => {
    await account.deleteSession({
      sessionId: 'current',
    })

    loggedInUser.value = null
  }

  return {
    loggedInUser,
    login,
    register,
    logout,
  }
}