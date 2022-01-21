import { MockedProvider } from "@apollo/client/testing";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Member from "@/components/Member";
import {
  USER_LOGIN,
  USER_PASSWORD_CHANGE,
  USER_REGISTER,
  USER_REQUEST_PASSCODE,
} from "@/graphql/documentNodes";
// mock input data
const loginFormData = {
    email: "ebbs@gmail.com",
    password: "ebbs2022",
  },
  clientFormData = {
    username: "mocking",
    ...loginFormData,
  },
  clientProviderFormData = {
    ...clientFormData,
    title: "mock title",
    logo: new File(["logo file"], "logo.png", {
      type: "image/png",
    }),
    description: "Test description",
    state: "Lagos",
  },
  networkErrorMessage = "Oops! Network error",
  tokenPair = { accessToken: "12345" },
  recoveryFormData = { email: loginFormData.email },
  changePasswordFormData = {
    passCode: "secret",
    newPassword: "strong_password",
  };

describe("Member Component", () => {
  afterEach(cleanup);
  // login tab test cases
  it("logs in without error", async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_LOGIN,
              operationName: "UserLogin",
              variables: loginFormData,
            },
            result: {
              data: tokenPair,
            },
          },
        ]}
      >
        <Member />
      </MockedProvider>
    );
    userEvent.type(screen.getByTestId("loginEmail"), loginFormData.email);
    userEvent.type(screen.getByTestId("loginPassword"), loginFormData.password);
    // check input values
    expect(screen.getByTestId("loginForm")).toHaveFormValues(loginFormData);
    userEvent.click(screen.getByTestId("loginButton"));
    // form data reset when sent successfully
    expect(screen.getByTestId("loginForm")).toHaveFormValues({
      email: "",
      password: "",
    });
    // loading while spinning EBBS
    expect(await screen.findByText("EBBS")).toBeInTheDocument();
    // no alert means error
    expect(screen.queryByText("Alert")).not.toBeInTheDocument();
  });
  it("gracefully handles login network error", async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_LOGIN,
              operationName: "UserLogin",
              variables: loginFormData,
            },
            error: new Error(networkErrorMessage),
          },
        ]}
      >
        <Member />
      </MockedProvider>
    );
    userEvent.type(screen.getByTestId("loginEmail"), loginFormData.email);
    userEvent.type(screen.getByTestId("loginPassword"), loginFormData.password);
    // check input values
    expect(screen.getByTestId("loginForm")).toHaveFormValues(loginFormData);
    userEvent.click(screen.getByTestId("loginButton"));
    // form data reset when sent successfully
    expect(screen.getByTestId("loginForm")).toHaveFormValues({
      email: "",
      password: "",
    });
    // confirm error message
    expect(await screen.findByText(networkErrorMessage)).toBeInTheDocument();
  });
  // register tab test cases
  it("creates a client profile", async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_REGISTER,
              operationName: "UserRegister",
              variables: {
                userRegisterInput: clientFormData,
              },
            },
            result: { data: tokenPair },
          },
        ]}
      >
        <Member />
      </MockedProvider>
    );
    userEvent.type(
      screen.getByTestId("registerUsername"),
      clientFormData.username
    );
    userEvent.type(screen.getByTestId("registerEmail"), clientFormData.email);
    userEvent.type(
      screen.getByTestId("registerPassword"),
      clientFormData.password
    );
    userEvent.type(
      screen.getByTestId("registerConfirmPassword"),
      clientFormData.password
    );
    // check input values
    expect(screen.getByTestId("registerForm")).toHaveFormValues(clientFormData);
    // click submit button
    userEvent.click(screen.getByTestId("registerButton"));
    // form data reset when sent successfully
    expect(screen.getByTestId("registerForm")).toHaveFormValues({
      username: "",
      email: "",
      password: "",
    });
    // no alert means no error
    expect(screen.queryByText("Alert")).not.toBeInTheDocument();
  });
  it("creates a client with provider profile", async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_REGISTER,
              operationName: "UserRegister",
              variables: {
                userRegisterInput: clientProviderFormData,
              },
            },
            result: { data: tokenPair },
          },
        ]}
      >
        <Member />
      </MockedProvider>
    );
    // username input
    userEvent.type(
      screen.getByTestId("registerUsername"),
      clientProviderFormData.username
    );
    // email input
    userEvent.type(screen.getByTestId("registerEmail"), clientFormData.email);
    // password input
    userEvent.type(
      screen.getByTestId("registerPassword"),
      clientProviderFormData.password
    );
    // confirm password
    userEvent.type(
      screen.getByTestId("registerConfirmPassword"),
      clientProviderFormData.password
    );
    // service title
    userEvent.type(
      screen.getByTestId("registerServiceName"),
      clientProviderFormData.title
    );
    // check input values
    expect(screen.getByTestId("registerForm")).toHaveFormValues(clientFormData);
    // click submit button
    userEvent.click(screen.getByTestId("registerButton"));
    // form data reset when sent successfully
    expect(screen.getByTestId("registerForm")).toHaveFormValues({
      username: "",
      email: "",
      password: "",
    });
    // no alert means no error
    expect(screen.queryByText("Alert")).not.toBeInTheDocument();
  });
  // lost password tab
  it("requests passcode without error", () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_REQUEST_PASSCODE,
              operationName: "RequestPassCode",
              variables: recoveryFormData,
            },
            result: {
              data: {
                requestPassCode: "Passcode sent to your email.",
              },
            },
          },
        ]}
      >
        <Member />
      </MockedProvider>
    );

    userEvent.type(screen.getByTestId("recoveryEmail"), recoveryFormData.email);
    userEvent.click(screen.getByTestId("recoverySendButton"));
    // form reset inputs when sent successfully
    expect(screen.getByTestId("recoveryForm")).toHaveFormValues({
      email: "",
    });
    // no alert means no error
    expect(screen.queryByText("Alert")).not.toBeInTheDocument();
  });

  it("request password change without error", () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_PASSWORD_CHANGE,
              operationName: "PasswordChange",
              variables: changePasswordFormData,
            },
            result: {
              data: {
                changePassword: tokenPair,
              },
            },
          },
        ]}
      >
        <Member />
      </MockedProvider>
    );

    userEvent.type(
      screen.getByTestId("changePassCode"),
      changePasswordFormData.passCode
    );
    userEvent.type(
      screen.getByTestId("changePassword"),
      changePasswordFormData.newPassword
    );
    userEvent.type(
      screen.getByTestId("changeConfirmPassword"),
      changePasswordFormData.newPassword
    );

    userEvent.click(screen.getByTestId("changeSubmit"));
    // form inputs reset when submit succeeds
    expect(screen.getByTestId("changePasswordForm")).toHaveFormValues({
      passCode: "",
      password: "",
      confirmPassword: "",
    });
    // no alert means no error
    expect(screen.queryByText("Alert")).not.toBeInTheDocument();
  });
});
