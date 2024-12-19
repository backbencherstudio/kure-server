/* eslint-disable @typescript-eslint/no-explicit-any */
import { redisClient } from "../config/redis";


// ================================================================== Users
export const setCache = async (value: any, expiry = 3600) => {
  try {
   await redisClient.set('users', JSON.stringify(value), { EX: expiry });    
  } catch (error) {
    console.error(`Failed to set cache for key: users`, error);
  }
};
export const getCache = async (): Promise<any | null> => {
  try {
    const cachedData = await redisClient.get('users');
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error(`Failed to get cache for key: users`, error);
    return null;
  }
};


// ========================================================================= audios 
// export const setAllAudiosCache = async (value : any, expiry = 3600)=>{
//     try{
//         await redisClient.set("audios", JSON.stringify(value), {EX : expiry});
//     }catch(error){
//         console.log("failed");        
//     }
// }

// export const getAllAudiosCache = async () : Promise<any | null>=>{
//     try{
//         const cacheData = await redisClient.get("audios")
//         return cacheData ? JSON.parse(cacheData) : null
//     }catch(error){
//         console.log("failed");        
//     }
// }

// =============================================================================       
// export const setAllAudiosCache = async (value: any, expiry = 3600) => {
//     try {
//       await redisClient.set("audios", JSON.stringify(value), { EX: expiry });
//     } catch (error) {
//       console.error("Failed to set cache for 'audios':", error);
//     }
//   };
  
//   export const getAllAudiosCache = async (): Promise<any | null> => {
//     try {
//       const cacheData = await redisClient.get("audios");
//       return cacheData ? JSON.parse(cacheData) : null;
//     } catch (error) {
//       console.error("Failed to get cache for 'audios':", error);
//       return null;
//     }
//   };
  

export const setAllAudiosCache = async (data: Record<string, any>, expiry = 3600) => {
    try {
      await redisClient.set("audios", JSON.stringify(data), { EX: expiry });
    } catch (error) {
      console.error("Failed to set cache for 'audios':", error);
    }
  };
  
  export const getAllAudiosCache = async (): Promise<Record<string, any> | null> => {
    try {
      const cacheData = await redisClient.get("audios");
      return cacheData ? JSON.parse(cacheData) : null;
    } catch (error) {
      console.error("Failed to get cache for 'audios':", error);
      return null;
    }
  };
  





// import { redisClient } from "../config/redis";
// import { setAllAudios } from './cashData';

// export const cacheUser = async (userId: string, userData: any) => {
//   await redisClient.set(`user:${userId}`, JSON.stringify(userData), {
//     EX: 3600,
//   });
// };

// export const cacheAllUsers = async (users: any[]) => {
//   await redisClient.set("users:all", JSON.stringify(users), { EX: 3600 });
// };

// export const updateCachedUserList = async (updatedUser: any) => {
//   const cachedUsers = await redisClient.get("users:all");
//   let usersList = cachedUsers ? JSON.parse(cachedUsers) : [];

//   const userIndex = usersList.findIndex(
//     (user: any) => user._id === updatedUser._id
//   );

//   if (userIndex > -1) {
//     usersList[userIndex] = updatedUser;
//   } else {
//     usersList.push(updatedUser);
//   }

//   await cacheAllUsers(usersList);
// };

// export const cacheProjectData = async (projectId: string, projectData: any) => {
//   await redisClient.set(projectId, JSON.stringify(projectData), { EX: 3600 }); // 1-hour expiration
// };

// export const getCachedProjectData = async (projectId: string) => {
//   const cachedData = await redisClient.get(projectId);

//   return cachedData ? JSON.parse(cachedData) : null;
// };

// export const updateTaskInCache = async (projectId: string, task: any) => {
//   const cachedProject = await getCachedProjectData(projectId);
//   if (cachedProject) {
//     const taskIndex = cachedProject.tasks.findIndex(
//       (t: any) => t._id === task._id.toString()
//     );
//     if (taskIndex > -1) {
//       cachedProject.tasks[taskIndex] = task;
//     } else {
//       cachedProject.tasks.push(task);
//     }
//     await cacheProjectData(projectId, cachedProject);
//   }
// };

// export const removeTaskFromCache = async (
//   projectId: string,
//   taskId: string
// ) => {
//   const cachedProject = await getCachedProjectData(projectId);
//   if (cachedProject) {
//     cachedProject.tasks = cachedProject.tasks.filter(
//       (t: any) => t._id !== taskId
//     );
//     await cacheProjectData(projectId, cachedProject);
//   }
// };

// export const updatenewTaskInCache = async (projectId: string, newTask: any) => {
//   const cachedProjectData = await redisClient.get(projectId);

//   if (cachedProjectData) {
//     const projectData = JSON.parse(cachedProjectData);
//     projectData.tasks.push(newTask);
//     await redisClient.set(projectId, JSON.stringify(projectData), { EX: 3600 });
//   }
// };

// export const cacheProject = async (projectData: any) => {
//   await redisClient.set(`allProject`, JSON.stringify(projectData), {
//     EX: 3600,
//   });
// };

// export const getCacheProject = async () => {
//   const cachedData = await redisClient.get(`allProject`);

//   return cachedData ? JSON.parse(cachedData) : null;
// };

 
// export const updateCacheProject = async (updatedProject: any) => {
//   try {
//     const cachedProjects = await redisClient.get("allProject");
//     let projectList = cachedProjects ? JSON.parse(cachedProjects) : [];
//     console.log("Update Project", updatedProject);
//     console.log("Project list", projectList);

 
//     const projectIndex = projectList.findIndex(
//       (project: any) => String(project._id) === String(updatedProject._id)
//     );
//     console.log("projectIndex", projectIndex);

//     console.log("102",projectList[projectIndex])
//     if (projectIndex > -1) {
//       projectList[projectIndex] = updatedProject;
//     } else {
//       projectList.push(updatedProject);
//     }

  
//     await redisClient.set("allProject", JSON.stringify(projectList));
//   } catch (error) {
//     console.error("Error updating project cache:", error);
//   }
// };


// export const removeCacheProject = async (projectId: string) => {
//   try {
//     const cachedProjects = await redisClient.get("allProject");
//     let projectList = cachedProjects ? JSON.parse(cachedProjects) : [];
//     console.log("Removing Project with ID:", projectId);
//     console.log("Current Project List:", projectList);

 
//     projectList = projectList.filter(
//       (project: any) => String(project._id) !== String(projectId)
//     );

//     // Cache the updated project list back to Redis
//     await redisClient.set("allProject", JSON.stringify(projectList));
 
//   } catch (error) {
//     console.error("Error removing project from cache:", error);
//   }
// };

// export const addNewUserCacheProject = async (projectId: string, user: any) => {
//   try {
//     // Fetch existing projects from the cache
//     const cachedProjects = await redisClient.get("allProject");
//     let projectList = cachedProjects ? JSON.parse(cachedProjects) : [];

//     // Find the index of the project to update
//     const projectIndex = projectList.findIndex(
//       (project: any) => String(project._id) === String(projectId)
//     );

//     console.log("Project index found:", projectIndex);

//     if (projectIndex > -1) {
//       // Push the new user to the users array
//       projectList[projectIndex].users.push(user);
//       console.log("Updated users array:", projectList[projectIndex].users);

//       // Update the cache
//       await redisClient.set("allProject", JSON.stringify(projectList));
//       console.log("Cache successfully updated");

//     } else {
//       console.error(`Project ID ${projectId} not found`);
//     }
//   } catch (error) {
//     console.error("Error while updating the cache:", error);
//   }
// };