import Node from "../models/nodeModel.js";
import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import dotenv from "dotenv";
import Vm from "../models/vmModel.js";
dotenv.config();

const launchNode = TryCatch(async (req, res, next) => {
  const { nodeName, nodePrice, slots, bgColor } = req.body;
  const node = await Node.create({
    nodeName: nodeName.toLowerCase(),
    nodePrice,
    slots,
    user: req.user?.id,
    bgColor: bgColor,
    nodeImage: {
      url: req.file?.filename,
    },
  });
  res.status(201).json({
    status: "success",
    data: {
      node,
    },
  });
});

const updateNode = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const node = await Node.findById(id);
  if (!node) {
    return next(new ErrorHandler("Node not found", 404));
  }
  // if (node.user && node.user.toString() !== req.user.id) {
  //   return next(
  //     new ErrorHandler("You are not allowed to update this node", 403)
  //   );
  // }
  console.log("req.body:", req.body)
  let nodePrice = JSON.parse(req.body.nodePrice)
  const { nodeName, slots, bgColor } = req.body;

  const updateFields = {};
  if (nodeName) {
    updateFields.nodeName = nodeName.toLowerCase();
  }
  if (nodePrice !== undefined) {
    updateFields.nodePrice = nodePrice;
  }
  if (req.file?.filename) {
    updateFields.nodeImage = {
      url: req.file?.filename,
    };
  }
  if (slots !== undefined) {
    updateFields.slots = slots;
  }
  if (bgColor !== undefined) {
    updateFields.bgColor = bgColor;
  }
  console.log("updateFields :", updateFields);
  const updatedNode = await Node.findByIdAndUpdate(id, updateFields, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      updatedNode,
    },
  });
});

const deleteNode = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  try {
    const node = await Node.findById(id);

    if (!node) {
      return next(new ErrorHandler("Node not found", 404));
    }

    if (node.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("You are not allowed to delete this node", 403)
      );
    }

    await Node.findByIdAndDelete({ _id: id });

    res.status(200).json({
      status: true,
      message: "Node deleted successfully",
      data: {},
    });
  } catch (error) {
    return next(new ErrorHandler("Error deleting node", 500));
  }
});

const getNode = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const node = await Node.findById(id);
  if (!node) {
    return next(new ErrorHandler("Node not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      node,
    },
  });
});

const getAllNodes = TryCatch(async (req, res, next) => {
  // try {
  //   const nodes = await Node.find();
  //   if (!nodes || nodes.length === 0) {
  //     return next(new ErrorHandler("No nodes found", 404));
  //   }
  //   const avail = nodes.length > 0 && nodes.map(async (item) => {
  //     return await Vm.find({ node_type: item?.nodeName });
  //   })

  //     res.status(200).json({
  //       success: true,
  //       nodes,
  //     });
  // try {
  //   const nodes = await Node.find();
  //   if (!nodes || nodes.length === 0) {
  //     return next(new ErrorHandler("No nodes found", 404));
  //   }

  //   const nodesWithDetails = await Promise.all(nodes.map(async (node) => {
  //     const vms = await Vm.find({ node_type: node.nodeName });
  //     const slotCount = vms.reduce((count, vm) => count + vms.length , 0);

  //     return {
  //       nodeName: node.nodeName,
  //       slotCount: slotCount,
  //     };
  //   }));
  //   console.log("🚀 ~ nodesWithDetails ~ nodesWithDetails:", nodesWithDetails)
  // } catch (error) {
  //   res.status(500).json({
  //     success: false,
  //     message: "Failed to fetch nodes",
  //     error: error.message,
  //   });
  // }
  try {
    const nodes = await Node.find();
    console.log("🚀 ~ nodes:", nodes)
    
    if (!nodes || nodes.length === 0) {
      return next(new ErrorHandler("No nodes found", 404));
    }

    const nodesWithDetails = await Promise.all(nodes.map(async (node) => {
      const vms = await Vm.find({ node_type: node.nodeName, is_attached: false });
      const vmCount = vms.length;
      node.slots = vmCount;

      return {
        node
      };
    }));
    res.status(200).json({
      success: true,
      nodes: nodesWithDetails,
    });
  } catch (error) {
    next(error);
  }

});

export { launchNode, updateNode, deleteNode, getAllNodes, getNode };
