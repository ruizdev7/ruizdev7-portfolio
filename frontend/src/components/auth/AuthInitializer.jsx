import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeAuth } from "../../RTK_Query_app/state_slices/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Inicializar el estado de autenticación desde localStorage
    dispatch(initializeAuth());
  }, [dispatch]);

  // Este componente no renderiza nada, solo inicializa la autenticación
  return null;
};

export default AuthInitializer;
