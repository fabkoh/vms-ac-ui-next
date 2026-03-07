import { useApi } from "./api-config";
import { sendApi } from "./api-helpers";
import type { EmailConfig } from "../types/models";

class NotificationsApi {
  backToDefault(): Promise<Response> | undefined {
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

  changeSMSEnablement(enabled: boolean): Promise<Response> | undefined {
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

  changeEmailEnablement(enabled: boolean): Promise<Response> | undefined {
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

  getSMSSettings(): Promise<Response> | undefined {
    if (useApi) {
      return sendApi("/api/notification/sms");
    }
  }

  getEmailSettings(): Promise<Response> | undefined {
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
  }: EmailConfig): Promise<Response> | undefined {
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

  updateSMS(SMSApiKey: string): Promise<Response> | undefined {
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
    }: EmailConfig & { custom?: boolean },
    recipentUser: string,
    recipentEmail: string
  ): Promise<Response> | undefined {
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

  testSMS(recipentSMS: string): Promise<Response> | undefined {
    console.log("recipentSMS:", recipentSMS);
    console.log("JSON body:", JSON.stringify({ recipentSMS }));

    if (useApi) {
      return sendApi("/api/notification/sms/test", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          recipentSMS,
        }),
      });
    }
  }

  getSMSCredits(): Promise<Response> | undefined {
    if (useApi) {
      return sendApi("/api/notification/sms/credits", {
        method: "GET",
      });
    }
  }
}

export const notificationsApi = new NotificationsApi();
