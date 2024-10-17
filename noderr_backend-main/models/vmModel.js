import mongoose from "mongoose";

const Schema = mongoose.Schema;

const vmSchema = new Schema(
  {
    user_id: {
      // type: String,
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      unique: false,
      sparse: true, // Add this line
      default: null,
    },
    nodeKey: {
      type: Schema.Types.ObjectId,
      ref: "Node",
      required: false,
      unique: false,
      default: null
    },
    vm_ip: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(v);
        },
        message: props => `${props.value} is not a valid IP address!`
      },
      unique: true
    },
    vm_username: {
      type: String,
      required: true,
    },
    vm_password: {
      type: String,
      required: true,
    },
    node_type: {
      type: String,
      required: true,
    },
    rpc_url: {
      type: String,
      required: false,
      default: null
    },
    purchase_date: {
      type: Date,
      required: false,
      default: null
    },
    expiry_date: {
      type: Date,
      required: false,
      default: null
    },
    promotionDays: {
      type: Number,
      required: false,
      default: 0
    },
    is_expiredMailSend:{
      type:Boolean,
      default:false
    },
    is_attached: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Vm = mongoose.model("Vm", vmSchema);

export default Vm;
