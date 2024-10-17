import deleteFuelNode from "../deployNodes/fuel/deleteFuel.js";
import deleteNubitLightNode from "../deployNodes/nubit/deleteNubit.js";
import deleteZeroGStorageNode from "../deployNodes/og/deleteOG.js";
import deleteRitual from "../deployNodes/ritual/deleteRitual.js";
import deleteWakuNode from "../deployNodes/waku/deleteWaku.js";
import Node from "../models/nodeModel.js";
import Vm from "../models/vmModel.js";
import { TryCatch } from "../utils/TryCatch.js";

const deleteNode = TryCatch(async (req, res, next) => {
  const nodeType = req.query.node_type;
  const userId = req.query.user_id;
  const checkNode = await Node.findOne({ nodeName: nodeType });
  console.log(req.query.node_type);
  const availableVm = await Vm.findOne({
    node_type: nodeType,
    user_id: userId,
    is_attached: true,
  });
  if (availableVm) {
    if (nodeType === "waku") {
      const deleted = await deleteWakuNode(availableVm);
    } else if (nodeType === "fuel") {
      const deleted = await deleteFuelNode(availableVm);
    } else if (nodeType === "ritual") {
      const deleted = await deleteRitual(availableVm);
    } else if (nodeType === "nubit") {
      const deleted = await deleteNubitLightNode(availableVm);
    } else if (nodeType === "og") {
      const deleted = await deleteZeroGStorageNode(availableVm);
    }
    const updatedVm = Vm.updateOne(
      { _id: availableVm._id },
      {
        $set: {
          user_id: null,
          rpc_url: null,
          purchase_date: null,
          expiry_date: null,
          is_attached: false,
          nodeKey: null,
          promotionDays: null
        },
      }
    )
      .then(() => {
        console.log("update successed!");
      })
      .catch((err) => {
        console.log("update failed!");
      });
    const response = {
      success: true,
      message: `"${nodeType}" Node deleted successfully`,
    }
    return res.json(response);
  }
  else {
    const data = {
      message: `There is no active vm for ${nodeType} node type!`,
    };
    return res.json(data);
  }

});

export {
  deleteNode
};

