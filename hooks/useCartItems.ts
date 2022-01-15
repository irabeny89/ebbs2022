import { cartItemsVar } from "@/graphql/reactiveVariables"
import { useReactiveVar } from "@apollo/client"

const useCartItems = () => {
  const cartItems = useReactiveVar(cartItemsVar)
  
}

export default useCartItems