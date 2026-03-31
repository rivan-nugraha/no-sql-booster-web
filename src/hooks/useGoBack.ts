import { useNavigate } from "@tanstack/react-router";


const useGoBack = () => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      window.history.back(); // Go back to the previous page
    } else {
      navigate({ to: "/" }); // Redirect to home if no history exists
    }
  };

  return goBack;
};

export default useGoBack;
