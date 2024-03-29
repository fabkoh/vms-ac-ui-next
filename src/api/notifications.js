import { useApi } from "./api-config";
import { sendApi } from "./api-helpers";

class NotificationsApi {
  backToDefault() {
    //for back to default
    if (useApi) {
      return sendApi(`/api/notification/email/backToDefault`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
      });
    }
  }

  changeSMSEnablement(enabled) {
    if (useApi) {
      return sendApi("/api/notification/sms/enablement", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          enabled,
        }),
      });
    }
  }

  changeEmailEnablement(enabled) {
    if (useApi) {
      return sendApi("/api/notification/email/enablement", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          enabled,
        }),
      });
    }
  }

  getSMSSettings() {
    if (useApi) {
      return sendApi("/api/notification/sms");
    }
  }

  getEmailSettings() {
    if (useApi) {
      return sendApi(`/api/notification/email`);
    }
  }

  updateEmail({
    emailSettingsId,
    username,
    email,
    emailPassword,
    hostAddress,
    portNumber,
    isTLS,
    enabled,
  }) {
    if (useApi) {
      return sendApi("/api/notification/email", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          emailSettingsId,
          username,
          email,
          emailPassword,
          hostAddress,
          portNumber,
          isTLS,
          enabled,
        }),
      });
    }
  }

  updateSMS(SMSApiKey) {
    // console.log(SMSApiKey);
    const smsAPI = SMSApiKey;
    console.log(smsAPI);
    if (useApi) {
      return sendApi("/api/notification/sms", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          smsAPI,
        }),
      });
    }
  }

  testSMTP(
    {
      emailSettingsId,
      username,
      email,
      emailPassword,
      hostAddress,
      portNumber,
      enabled,
      isTLS,
      custom,
    },
    recipentUser,
    recipentEmail
  ) {
    if (useApi) {
      return sendApi("/api/notification/testSMTP", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          emailSettingsId,
          username,
          email,
          emailPassword,
          hostAddress,
          portNumber,
          enabled,
          isTLS,
          recipentUser,
          recipentEmail,
          custom,
        }),
      });
    }
  }

  testSMS(recipentSMS) {
    console.log("recipentSMS:", recipentSMS);
    console.log("JSON body:", JSON.stringify({ recipentSMS }));

    if (useApi) {
      return sendApi("/api/notification/sms/test", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          //   smsAPI: "test",
          //   enabled: true,
          recipentSMS,
        }),
      });
    }
  }

  getSMSCredits() {
    if (useApi) {
      return sendApi("/api/notification/sms/credits", {
        method: "GET",
      });
    }
  }
}

export const notificationsApi = new NotificationsApi();
