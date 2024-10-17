import cron from "node-cron";
import moment from "moment";
import Vm from "../models/vmModel.js";
import sendMail from "./sendMail.js";

let subject = "Important Notice: Your VM Subscription is Nearing Expiry";
let description = `Dear,

We hope this message finds you well. This is a friendly reminder that your Virtual Machine (VM) subscription is set to expire in 24 hours. To ensure uninterrupted service, we recommend that you review and update your plan at your earliest convenience.

If you need any assistance or have any questions, please do not hesitate to contact our support team.

Thank you for choosing our services.

Best regards,

Noderr Team`;

const scheduleJobs = () => {
  cron.schedule("* * * * *", async () => {
    const oneDayBeforeNow = moment().add(1, "days").toISOString();
    const vms = await Vm.find({
      expiry_date: {
        $lt: oneDayBeforeNow,
      },
      is_expiredMailSend: false,
      is_attached: true,
    }).populate("user_id");

    await Promise.all(
      vms.map(async (vm) => {
        if (vm.user_id && vm.user_id.email) {
          await sendMail(vm.user_id.email, subject, description);
          vm.is_expiredMailSend = true;
          await vm.save();
        }
      })
    );
  });
};

export default scheduleJobs;
