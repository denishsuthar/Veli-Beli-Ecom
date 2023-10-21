import catchAsyncError from "../../middelware/catchAsyncError.js";
import { Admin } from "../../models/AdminModel/adminModel.js";
import ErrorHandler from "../../utils/errorHandler.js";
import fs from "fs";
import { Manager } from "../../models/ManagerModel/managerModel.js";
import NodeCache from "node-cache";
import { Client } from "../../models/ClientModel/clientModel.js";

export const cache = new NodeCache();
const messages = JSON.parse(fs.readFileSync("./messages.json", "utf8"));

// All Users
export const allUsers = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 5;
  const searchQuery = req.query.search || "";
  const roleFilter = req.query.role || "";

  // const usersCache = `${page}_${perPage}_${searchQuery}_${roleFilter}`;

  // const cachedData = cache.get(usersCache);

  // if (cachedData) {
  //   return res.status(200).json({
  //     success: true,
  //     data: cachedData,
  //     message: "Data from cache.",
  //   });
  // }

  const filter = {
    _id: { $ne: req.user._id },
    isDeleted: false,
  };

  if (roleFilter) {
    filter.role = roleFilter;
  }

  const admins = await Admin.find({
    $and: [
      { _id: { $ne: req.user._id } },
      { isDeleted: false },
      filter,
      {
        $or: [
          { firstName: { $regex: searchQuery, $options: "i" } },
          { lastName: { $regex: searchQuery, $options: "i" } },
        ],
      },
    ],
  }).sort({ _id: -1 });

  const managers = await Manager.find({
    $and: [
      { _id: { $ne: req.user._id } },
      { isDeleted: false },
      filter,
      {
        $or: [
          { firstName: { $regex: searchQuery, $options: "i" } },
          { lastName: { $regex: searchQuery, $options: "i" } },
        ],
      },
    ],
  }).sort({ _id: -1 });

  const clients = await Client.find({
    $and: [
      { _id: { $ne: req.user._id } },
      { isDeleted: false },
      filter,
      {
        $or: [
          { firstName: { $regex: searchQuery, $options: "i" } },
          { lastName: { $regex: searchQuery, $options: "i" } },
        ],
      },
    ],
  }).sort({ _id: -1 }).select("-gstDetails").select("-deviceIDs");

  const combinedUsers = [...admins, ...managers, ...clients];
  combinedUsers.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());

  const totalUsers = combinedUsers.length;
  const totalPages = Math.ceil(totalUsers / perPage);

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const usersForPage = combinedUsers.slice(startIndex, endIndex);

  // cache.set(usersCache, usersForPage, 3600);
  

  res.status(200).json({
    success: true,
    data: usersForPage,
    totalPages,
    currentPage: page,
    totalUsers,
  });
});

// All Users By Id
export const allUserById = catchAsyncError(async(req,res,next)=>{
    let user = await Admin.findById(req.params.id)
    if(!user) {
      user = await Manager.findById(req.params.id)
    }
    if(!user) {
      user = await Client.findById(req.params.id)
    }
    if(!user) return next(new ErrorHandler(messages.notFound, 404))
    
    res.status(200).json({
      success:true,
      user
    })
  })

// Create Admin
export const createAdmin = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, password, mobileNumber, role, status } =
    req.body;

  if (!firstName || !lastName || !email || !password || !mobileNumber || !role)
    return next(new ErrorHandler(messages.allFieldRequired, 400));

  const existingAdmin = await Admin.findOne({ email });
  const existingManager = await Manager.findOne({ email });
  const existingClient = await Client.findOne({ email });
  if (existingAdmin || existingManager || existingClient)
    return next(new ErrorHandler(messages.alreadyRegistered, 400));

  const existingAdminWithMobile = await Admin.findOne({ mobileNumber });
  const existingManagerWithMobile = await Manager.findOne({ mobileNumber });
  const existingClientWithMobile = await Client.findOne({ mobileNumber });
  if (existingAdminWithMobile || existingManagerWithMobile || existingClientWithMobile) {
    return next(new ErrorHandler(messages.mobileInUse, 400));
  }

  const admin = new Admin({
    firstName,
    lastName,
    email,
    mobileNumber,
    password,
    role,
    status,
  });

  await admin.save();

  const page = parseInt(req.query.page) || 1;
  const perPage = 5;
  const searchQuery = req.query.search || "";
  const roleFilter = req.query.role || "";
  const usersCache = `${page}_${perPage}_${searchQuery}_${roleFilter}`;

  cache.del(usersCache);

  admin.password = undefined;

  res.status(201).json({
    success: true,
    message: messages.createAdmin,
  });
});

// Create Manager
export const createManager = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, password, mobileNumber, role, status } =
    req.body;

  if (!firstName || !lastName || !email || !password || !mobileNumber || !role)
    return next(new ErrorHandler(messages.allFieldRequired, 400));

  const existingAdmin = await Admin.findOne({ email });
  const existingManager = await Manager.findOne({ email });
  const existingClient = await Client.findOne({ email });
  if (existingAdmin || existingManager || existingClient)
    return next(new ErrorHandler(messages.alreadyRegistered, 400));

  const existingAdminWithMobile = await Admin.findOne({ mobileNumber });
  const existingManagerWithMobile = await Manager.findOne({ mobileNumber });
  const existingClientWithMobile = await Client.findOne({ mobileNumber });
  if (existingAdminWithMobile || existingManagerWithMobile || existingClientWithMobile) {
    return next(new ErrorHandler(messages.mobileInUse, 400));
  }

  const manager = new Manager({
    firstName,
    lastName,
    email,
    mobileNumber,
    password,
    role,
    status,
  });

  await manager.save();

  const page = parseInt(req.query.page) || 1;
  const perPage = 5;
  const searchQuery = req.query.search || "";
  const roleFilter = req.query.role || "";
  const usersCache = `${page}_${perPage}_${searchQuery}_${roleFilter}`;

  cache.del(usersCache);

  manager.password = undefined;

  res.status(201).json({
    success: true,
    message: messages.createManager,
  });
});
