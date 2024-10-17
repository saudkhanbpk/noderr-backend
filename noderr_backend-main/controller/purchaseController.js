import Node from "../models/nodeModel.js";
import PromotionCode from "../models/promotionCodeModel.js";
import PurchaseNode from "../models/purchaseNodeModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { checkAvailPromoCode } from "../utils/PromoCodeHandle.js";
import { TryCatch } from "../utils/TryCatch.js";
import Vm from "../models/vmModel.js";
import deployWakuNode from "../deployNodes/waku/deployWaku.js";
import sendSepoliaToUser from "../deployNodes/waku/sendSepoliaToUser.js";
import deployFuelNode from "../deployNodes/fuel/deployFuel.js";
import deployRitual from "../deployNodes/ritual/deployRitual.js";
import sendBaseEthToUser from "../deployNodes/ritual/sendBaseEthToUser.js";
import deployNubitLightNode from "../deployNodes/nubit/deployNubit.js";
import deployZeroGStorageNode from "../deployNodes/og/deployOG.js";
import RPCURL from "../models/RPCURLModel.js";

const checkNodeBeforePurchase = TryCatch(async (req, res, next) => {
  if (
    req.query.node_type === "waku" ||
    req.query.node_type === "fuel" ||
    // req.query.node_type === "ritual" ||
    req.query.node_type === "nubit" ||
    req.query.node_type === "og"
  ) {

    if (req.query.node_type === "waku" || req.query.node_type === "fuel") {
      const checkRpcUrl = await RPCURL.findOne({
        node_type: req.query.node_type
      });
      if (!checkRpcUrl) {
        const response = {
          message: `Node is not launched yet for ${req.query.node_type} node!`,
          success: false,
        };
        return res.json(response);
      }
    }
    const availableNodeVm = await Vm.findOne({
      node_type: req.query.node_type,
      is_attached: false,
    });

    if (availableNodeVm) {
      const response = {
        message: "Node Vm found",
        success: true,
      };
      return res.json(response);
    } else {
      const response = {
        message: `There is no available vm for ${req.query.node_type} node!`,
        success: false,
      };

      return res.json(response);
    }
  } else {
    const response = {
      message: `There is no active node available`,
      success: false,
    };

    return res.json(response);
  }
});

const purchaseNode = TryCatch(async (req, res, next) => {
  if (req.body.invoice_id) {
    if (req.body.payment_status !== "finished") {
      return
    }
  }
  let checkCode;
  let daysRemaining;
  let combineUrl = null;
  const promoCode = req.query?.promo_code;
  const userId = req.query.user_id;


  if (req.query.node_type === "waku" || req.query.node_type === "fuel") {

    let getRpcUrl = await RPCURL.findOne({
      node_type: req.query.node_type
    });
    combineUrl = getRpcUrl?.url + req.query.rpc_url;
  }

  const data = {
    node_type: req.query.node_type,
    private_key: req.query.private_key,
    user_id: req.query.user_id,
    purchase_duration: req.query.purchase_duration,
    rpc_url: combineUrl,
  };

  const checkNode = await Node.findOne({
    nodeName: data.node_type, slots: { $gte: 1 }
  })
  if (!checkNode) {
    return next(new ErrorHandler("Slots not available", 200));
  }
  if (promoCode) {
    let checkAvail = await checkAvailPromoCode(promoCode, userId);
    if (checkAvail.success == false) {
      return next(new ErrorHandler(checkAvail.message, 200));
    }
    checkCode = await PromotionCode.findOne({ code: promoCode });
    if (!checkCode) {
      return next(new ErrorHandler("Promo code not found", 200));
    }
  }

  console.log(data.node_type);
  const availableVm = await Vm.findOne({
    node_type: data.node_type,
    is_attached: false,
  });

  if (availableVm) {
    let response;
    const purchaseDate = new Date(); // Get the current date and time
    const expiryDate = new Date(
      purchaseDate.getTime() +
      parseInt(req.query.purchase_duration) * 30 * 24 * 60 * 60 * 1000
    );
    if (promoCode) {
      const purchaseDate1 = new Date();
      const expiryDate1 = new Date(checkCode.expiryDate);
      const timeDifference = expiryDate1 - purchaseDate1;
      daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    }
    if (data.node_type === "waku") {
      sendSepoliaToUser(data.private_key);
      const monitoring = availableVm.vm_ip + ":3000/d/yns_4vFVk/nwaku-monitoring?orgId=1&refresh=1m";
      response = {
        success: true,
        message: "Successed in waku node deploy.",
        monitoring_url: monitoring,
      };
      const deployed = await deployWakuNode(availableVm, data);
    } else if (data.node_type === "fuel") {
      const deployed = await deployFuelNode(availableVm, data);
      const monitoring = availableVm.vm_ip + ":19999";
      const fuel_rpc = "http://" + availableVm.vm_ip + ":4000/graphql";
      response = {
        success: true,
        message: "Succeed in fuel node deploy.",
        monitoring_url: monitoring,
        fuel_rpc: fuel_rpc,
      };
    } else if (data.node_type === "ritual") {
      // sendBaseEthToUser(req.query.private_key);
      const deployed = deployRitual(availableVm, data);
      const monitoring = availableVm.vm_ip + ":19999";
      response = {
        success: true,
        message: "Ritual Node deployed successfully",
        privateKey: data.private_key,
        monitoring_url: monitoring,
      }
    } else if (data.node_type === "nubit") {
      const monitoring = availableVm.vm_ip + ":19999";
      const interact_guide = "https://docs.nubit.org/nubit-da/interact-with-nubit-da/explore-more-node-operations";
      const deployed = deployNubitLightNode(availableVm, data);
      response = {
        success: true,
        message: "Nubit Light Node was deployed successfully",
        monitoring_url: monitoring,
        interact: `You can find how to interact with your nubit node here => ${interact_guide}`
      }
    } else if (data.node_type === "og") {
      const monitoring = availableVm.vm_ip + ":19999";
      const deployed = deployZeroGStorageNode(availableVm, data);
      const interact_guide = "https://docs.0g.ai/0g-doc/docs/0g-storage/rpc-api/node-api";
      response = {
        success: true,
        message: "ZeroGStroage Node was deployed successfully",
        monitoring_url: monitoring,
        interact: `You can find how to interact with your nubit node here => ${interact_guide}`
      }
    }

    const updatedVm = await Vm.updateOne(
      { _id: availableVm._id },
      {
        $set: {
          user_id: req.query.user_id,
          rpc_url: combineUrl,
          purchase_date: purchaseDate,
          expiry_date: expiryDate,
          is_attached: true,
          nodeKey: checkNode?._id,
          promotionDays: promoCode ? daysRemaining : null
        },
      }
    )
    const updateNodeSlots = await Node.updateOne(
      { _id: checkNode._id },
      {
        $set: {
          slots: checkNode.slots - 1
        }
      }
    )
    // .then(() => {
    //   console.log("update succeed!");
    // })
    // .catch((err) => {
    //   console.log("update failed!");
    // });
    return res.json(response);
  } else {
    console.log(`There is no available vm for "${data.node_type}" Node!`);
    const response = {
      success: false,
      message: `There is no available vm for "${data.node_type}" Node!`
    }
    return res.json(response);
  }
});

const getPurchaseNodes = TryCatch(async (req, res, next) => {
  const userId = req.user.id;
  const purchases = await PurchaseNode.find({ user: userId }).populate(
    "purchaseNodes.node"
  );

  if (!purchases) {
    return next(new ErrorHandler("No purchase found", 404));
  }

  res.status(200).json({
    success: true,
    data: purchases,
  });
});

const renewPurchaseNode = TryCatch(async (req, res, next) => {
  const userId = req.user.id;
  const purchaseId = req.params.id;
  const purchase = await PurchaseNode.findOne({ user: userId });
  if (!purchase) {
    return next(new ErrorHandler("No purchase found", 404));
  }

  const purchaseNode = purchase.purchaseNodes.find((node) => {
    return node.node.toString() === purchaseId;
  });

  if (!purchaseNode) {
    return next(new ErrorHandler("No purchase node found", 404));
  }
  if (purchaseNode.expiryDate > new Date()) {
    return next(new ErrorHandler("Purchase node has not expired", 404));
  }

  const { durationMonths } = req.body;
  purchaseNode.durationMonths = durationMonths;
  await purchase.save();
  res.status(200).json({
    success: true,
    data: purchase,
  });
});

export {
  purchaseNode,
  getPurchaseNodes,
  renewPurchaseNode,
  checkNodeBeforePurchase,
};
