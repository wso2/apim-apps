 #!/bin/bash

 git status 2>/dev/null; 
 if [ "$?" == 0 ];then
    if [ "$1" == "publisher" ] || [ "$1" == "devportal" ] || [ "$1" == "admin" ] ;then
      
    cd ../portals/"$1"
      if test -z "$2"
        then
          git stash
          git checkout main
          git pull https://github.com/wso2/apim-apps.git
          echo "Done Pulling"
          snyk test --json-file-output="../../security/security-backend/resources/$1".json
          mkdir ../../temp/
          cp ../../security/security-backend/resources/$1.json  ../../temp/
          git stash pop
          cp ../../temp/$1.json ../../security/security-backend/resources/
          rm -r  ../../temp

      else
          git stash
          git checkout "$2"
          if [ "$?" == 1 ] ;then
                    echo "Incorrect Argument for branch"
                      exit 1
          fi
          
          git pull origin "$2"
          echo "Done Pulling"
          snyk test --json-file-output="../../security/security-backend/resources/$1_$2".json
          mkdir ../../temp/
          cp ../../security/security-backend/resources/$1_$2.json  ../../temp/
          git stash pop
          git checkout main
          cp ../../temp/$1_$2.json ../../security/security-backend/resources/
          rm -r  ../../temp
      fi

    else
     echo "Incorrect Argument"
     exit
    fi
else
   echo "This is not a git repository."
fi




