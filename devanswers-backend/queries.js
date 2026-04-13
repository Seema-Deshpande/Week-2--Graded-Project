import mongoose from "mongoose";
import User from "./models/User.js";
import Question from "./models/Question.js";
import Answer from "./models/Answer.js";
import dotenv from "dotenv";

async function query1() {
  const newUser = await User.create({
    name: "Robin",
    email: "robin@example.com",
    password: "hashed_password_7",
    createdAt: new Date("2025-06-25T10:15:00Z"),
  });
  const userId = newUser._id;
  if (!userId) {
    console.error("Failed to create user");
    return;
  }
  console.log("Created User:", newUser);
}

async function query2() {
  // Write code for Query 2 here
  const user = await User.findOne({ email: "alice@example.com" });
  if (!user) {
    console.error("User with email alice@example.com not found");
    return;
  }
  console.log("Fetched User:", user);
}

async function query3() {
  // Write code for Query 3 here
  const question = await Question.findOne({
    title: "How can I improve the performance of a react app?"
  });
  if (!question) {
    console.error("Question with the specified title not found");
    return;
  }
  console.log("Fetched Question:", question);
}

async function query4() {
  // Write code for Query 4 here
  const questions = await Question.find({ tags: "javascript" });
  if (questions.length === 0) {
    console.error("No questions found with the tag 'javascript'");
    return;
  }
  console.log("Questions tagged with 'javascript':", questions);
}

async function query5() {
  // Write code for Query 5 here
  const questions = await Question.find({
    createdAt: { $gt: new Date("2023-04-01T00:00:00Z") }
  });
  if (questions.length === 0) {
    console.error("No questions found posted after April 1, 2023");
    return;
  }
  console.log("Questions posted after April 1, 2023:", questions);
}

async function query6() {
  // Write code for Query 6 here
  const questions = await Question.find({
    tags: {
      $in: ["javascript", "react"]
    }
  });
  if (questions.length === 0) {
    console.error("No questions found with the tags 'javascript' or 'react'");
    return;
  }
  console.log("Questions tagged with 'javascript' or 'react':", questions);
}

async function query7() {
  // Write code for Query 7 here
  const tags = await Question.distinct("tags");
  if(tags.length === 0) {
    console.error("No tags found in questions");
    return;
  }
  console.log("Distinct tags used in questions:", tags);
}

async function query8() {
  // Write code for Query 8 here
  const questions = await Question.find({
    views: {$gte: 50}
  });
  if( questions.length ===0) {
    console.error("No questions found with at least 50 views");
    return;
  }
  console.log("Questions with at least 50 views:", questions);
}

async function query9() {
  // Write code for Query 9 here
  const answers = await Answer.find({voteCount: 0});
  if(answers.length === 0) {
    console.error("No answers found with a vote count of 0");
    return;
  }
  console.log("Answers with a vote count of 0:", answers);
}

async function query10() {
  // Write code for Query 10 here
  const answers = await Answer.find({voteCount: {$gt: 0}});
  if(answers.length === 0) {
    console.error("No answers found with a vote count greater than 0");
    return;
  }
  console.log("Answers with a vote count greater than 0:", answers);
}

async function query11() {
  // Write code for Query 11 here
  const users = await User.find({
    createdAt: {
      $gte: new Date("2023-01-01T00:00:00Z"),
      $lt: new Date("2023-05-01T00:00:00Z")
    }
  });
  if(users.length === 0) {
    console.error("No users found with account created between January 1, 2023 and May 1, 2023");
    return;
  }
  console.log("Users with account created between January 1, 2023 and May 1, 2023:", users);
}

async function query12() {
  // Write code for Query 12 here
  const question = await Question.findOne({
    title: "How do I set up routing with react router v6?"
  });
  if(!question) {
    console.error("Question with the specified title not found");
    return;
  }
  const answers = await Answer.find({questionId: question._id}).select("answerText author");
  if(answers.length === 0) {
    console.error("No answers found for the specified question");
    return;
  }
  console.log("Answer text and author id of all answers for the specified question:", answers);
}

async function query13() {
  // Write code for Query 13 here

  // Approach 1: Using $nin operator to find users whose _id is not in the list of authors of answers (less efficient for large datasets due to subquery)

  /* const users = await User.find({
     _id: {
      $nin: await Answer.distinct("author")
    }
   });
  */

  // Approach 2: Using aggregation to perform a left outer join and filter users with no answers (better performance for large datasets)
  const users = await User.aggregate([
    {
      $lookup: {
        from: "answers",
        localField: "_id",
        foreignField: "author",
        as: "answers"
      }
    },
    {
      $match: {
        answers: { $size: 0 }
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1
      }
    }
  ]); 
  if(users.length === 0) {
    console.error("No users found who have not posted any answers");
    return;
  }
  console.log("Users who have not posted any answers:", users);
}

async function query14() {
  // Write code for Query 14 here
  const question  = await Question.find().sort({voteCount: -1}).limit(2);
  if(question.length === 0) {
    console.error("No questions found");
    return;
  }
  console.log("Top two most upvoted questions:", question);
}

async function query15() {
  // Write code for Query 15 here
  const usersWithAnswerCount = await Answer.aggregate([
    {
      $group: {
        _id: "$author",
        answerCount: {$sum: 1}
      }
    }
  ]);
  if(usersWithAnswerCount.length === 0) {
    console.error("No users found who have posted answers");
    return;
  }
  console.log("Ids of all users who have posted answers along with the number of answers they have posted:", usersWithAnswerCount);
}

async function query16() {
  // Write code for Query 16 here
  const topUsers = await Answer.aggregate([
    {
      $group: {
        _id: "$author",
        answerCount: {$sum: 1}
      }
    },
    {
      $sort: {answerCount: -1}
    },
    {
      $limit: 2
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails"
      }
    },
    {
      $unwind: "$userDetails"
    },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        name: "$userDetails.name",
        email: "$userDetails.email",
        answerCount: 1
      }
    }
  ]);
  if(topUsers.length === 0) {
    console.error("No top users found");
    return;
  }
  console.log("Top two users who posted the most answers:", topUsers);
}
async function query17() {
  // Write code for Query 17 here
  const question = await Question.findOneAndUpdate(
    { title: "Why is my async function returning a promise instead of the actual value?" },
    { $set: { tags: ["javascript", "async"] } },
    { new: true }
  );
  if(!question) {
    console.error("Question with the specified title not found");
    return;
  }
  console.log("Updated question tags:", question);
}

async function query18() {
  // Write code for Query 18 here
  const user = await User.findOneAndUpdate(
    { email: "alice@example.com" },
    { $set: { name: "Alice Smith" } },
    { new: true }
  );
  if(!user) {
    console.error(`User with email: alice@example.com not found`);
    return;
  }
  console.log("Updated user:", user);
}

async function query19() {
  // Write code for Query 19 here
  const user = await User.deleteOne({
    email: "jhonny@example.com"
  });
  if(user.deletedCount === 0) {
    console.error(`User with email: jhonny@example.com not found`);
    return;
  }
  console.log("Deleted user:", user);
}

async function query20() {
  // Write code for Query 20 here
  const user = await User.findOne({ email: "alice@example.com" });
  if(!user) {
    console.error(`User with email: alice@example.com not found`);
    return;
  }
  const result = await Answer.deleteMany({ author: user._id });
  console.log(`Deleted ${result.deletedCount} answers of user with email: alice@example.com`);
}

async function runQueries() {
  printHeader(
    1,
    "Create a user with name Robin, email robin@example.com, password hashed_password_7, and createdAt set to 2025-06-25T10:15:00Z",
  );
  // await query1();
  printHeader(2, "Fetch the user with email alice@example.com");
  await query2();
  printHeader(
    3,
    'Fetch question with the title "How can I improve the performance of a react app?"',
  );
  await query3();
  printHeader(4, 'Find all questions tagged with "javascript"');
  await query4();
  printHeader(5, "Retrieve all questions posted after April 1, 2023");
  await query5();
  printHeader(6, "Find all questions tagged with javascript or react");
  await query6();
  printHeader(7, "Find all the distinct tags used in questions");
  await query7();
  printHeader(8, "Retrieve all questions with at least 50 views");
  await query8();
  printHeader(9, "List all answers with a vote count of 0");
  await query9();
  printHeader(10, "Retrieve all answers with a voteCount greater than 0");
  await query10();
  printHeader(
    11,
    "Retrieve all users whose account was created between January 1, 2023 (inclusive) and May 1, 2023 (exclusive)",
  );
  await query11();
  printHeader(
    12,
    'Fetch the answer text and author id of all answers for the question "How do I set up routing with react router v6?"',
  );
  await query12();
  printHeader(13, "Find all users who have not posted any answers");
  await query13();
  printHeader(14, "Find the top two most upvoted questions");
  await query14();
  printHeader(
    15,
    "Retrieve the ids of all users who have posted answers, along with the number of answers they have posted",
  );
  await query15();
  printHeader(16, "Identify the top two users who posted the most answers");
  await query16();
  printHeader(
    17,
    "Update the tags of the question 'Why is my async function returning a promise instead of the actual value?' to ['javascript', 'async']",
  );
  await query17();
  printHeader(
    18,
    "Update the name of the user with email 'alice@example.com' to 'Alice Smith'",
  );
  await query18();
  printHeader(19, "Delete the user with email 'jhonny@example.com'");
  await query19();
  printHeader(
    20,
    "Delete all answers of the user with email 'alice@example.com'",
  );
  await query20();
}

const printHeader = (num, title) => {
  console.log("\n" + "─".repeat(60));
  console.log(`Q${num}. ${title}`);
  console.log("─".repeat(60));
};

async function main() {
  try {
    dotenv.config();
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully to database");
    await runQueries();
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

main();
