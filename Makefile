WORKING_DIR			= $(shell pwd)
CSVW_CHECK_DOCKER	:= gsscogs/csvw-check:latest
CSV2RDF_DOCKER		:= europe-west2-docker.pkg.dev/swirrl-devops-infrastructure-1/public/csv2rdf:v0.7.1
RIOT_DOCKER			:= gsscogs/gss-jvm-build-tools:latest
CSVW_CHECK			:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(CSVW_CHECK_DOCKER) /opt/docker/bin/csvw-check -s
CSV2RDF				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(CSV2RDF_DOCKER) csv2rdf -m minimal -u 
RIOT				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(RIOT_DOCKER) riot

CSVW_METADATA_FILES = $(wildcard remote/*-metadata.json)
TTL_FILES         	= $(CSVW_METADATA_FILES:remote/%-metadata.json=out/%.ttl)
JSON_LD_FILES 		= $(CSVW_METADATA_FILES:remote/%-metadata.json=out/%.json)

docker-pull:
	@echo "=============================== Pulling latest required docker images. ==============================="
	docker pull $(CSVW_CHECK_DOCKER)
	docker pull $(CSV2RDF_DOCKER)
	docker pull $(RIOT_DOCKER)
	@echo "" ; 


output-directory:
	@mkdir -p out

$(CSVW_METADATA_FILES): docker-pull output-directory

validate: $(CSVW_METADATA_FILES)
	@for file in $(CSVW_METADATA_FILES) ; do \
		echo "=============================== Validating $$file ===============================" ; \
		$(CSVW_CHECK) "$$file" ; \
		echo "" ; \
	done

ttl: $(TTL_FILES)

out/%.ttl: remote/%-metadata.json
	@echo "=============================== Converting $< to ttl $@ ===============================" ;
	$(CSV2RDF) "$<" -o "$@";
	@echo "" ;

jsonld: $(JSON_LD_FILES)

out/%.json: out/%.ttl
	@echo "=============================== Converting $< to JSON-LD $@ ===============================" ;
	$(RIOT) --syntax ttl --out json-ld "$<" > "$@";
	@echo "";

# todo: Can I split these up into a bunch of deparate JSON-LD files for each of the entities contained therein?


clean:
	@rm -rf "$(OUT_DIR)"
	@rm -f $(TTL_FILES)
	@rm -f $(JSON_LD_FILES)


.DEFAULT_GOAL := jsonld