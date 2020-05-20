[![DevOps_Microservices](https://circleci.com/gh/rayhan/DevOps_Microservices.svg?style=svg)](https://github.com/rayhan/DevOps_Microservices)


## Project Overview

This project utilize a pre-traind machine learning model and productionalize the ML prediction appication with in containerized scallable deployment environment.

---
## Dependencies
 - python3
 - pip
 - venv
 - Docker
 - Virtualbox
 - Kubernetes (minikube / sandalone cluster)

 
## Instruction

- Create a virtualenv and activate it
    
    ```
  python3 -m venv ~/.devops
  source ~/.devops/bin/activate   
    ```
- Run `make install` to install the necessary dependencies

### Running `app.py`

1. Standalone:  `python app.py`
2. Run in Docker:  `./run_docker.sh`
3. Run in Kubernetes:  `./run_kubernetes.sh`
4. Run prediction : `./make_prediction.sh`

### Project Files

- `.circleci/config.yml` contains circleci CI/CD pipeline configuration
- `model_data` folder contains pe-trained prediction model
- `app.py` main application file to run prediction API.
- `Dockerfile` docker build instructions to containerzie the python app
- `make_prediction.sh` test prediction by making HTTP call
- `makefile` The Makefile includes instructions on environment setup and lint tests
- `requirements.txt` contains python dependency list to install relevant python modules/libraries
- `run_docker.sh` a shell script that build and run docker container for the app
- `run_kubernates.sh` a shell script to run kubernetes deployment for the prediction app
- `upload_docker.sh` uploads docker image to dockerhub 
- `output_txt_files/docker_out.txt` and `output_txt_files/kubernetes_out.png` contains output of run_docker and run_kubernetes command
