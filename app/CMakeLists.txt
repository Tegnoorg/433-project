# Build the app, using the HAL

include_directories(include)
file(GLOB MY_SOURCES "src/*.c")
add_executable(light_sampler ${MY_SOURCES})

# Make use of the HAL library

# Specify the minimum version you require.
# find_package (mongoc-1.0 1.7 REQUIRED)
# The "hello_mongoc.c" sample program is shared among four tests.
# target_link_libraries (light_sampler PRIVATE mongo::mongoc_static)

target_link_libraries(light_sampler LINK_PRIVATE hal pthread m )


# Copy executable to final location (change `light_sampler` to project name as needed)
add_custom_command(TARGET light_sampler POST_BUILD 
  COMMAND "${CMAKE_COMMAND}" -E copy 
     "$<TARGET_FILE:light_sampler>"
     "~/cmpt433/public/light_sampler" 
  COMMENT "Copying ARM executable to public NFS directory")

add_custom_command(TARGET light_sampler POST_BUILD
   COMMAND "${CMAKE_COMMAND}" -E copy_directory
      "${CMAKE_SOURCE_DIR}/udpRelay"
      "~/cmpt433/public/server-copy"
   COMMENT "Copying NodeJS server to public NFS directory")

