.PHONY: docker-pull output-directories split clean bulk-ttl bulk-jsonld all init

WORKING_DIR			:= $$(pwd)
CSVW_CHECK_DOCKER	:= gsscogs/csvw-check:latest
CSV2RDF_DOCKER		:= europe-west2-docker.pkg.dev/swirrl-devops-infrastructure-1/public/csv2rdf:v0.7.1
JENA_CLI_DOCKER		:= gsscogs/gss-jvm-build-tools:latest
CSVW_CHECK			:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(CSVW_CHECK_DOCKER) /opt/docker/bin/csvw-check -s
CSV2RDF				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(CSV2RDF_DOCKER) csv2rdf -m minimal -u 
RIOT				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(JENA_CLI_DOCKER) riot
SPARQL				:= docker run --rm -v "$(WORKING_DIR)":/work -w /work $(JENA_CLI_DOCKER) sparql

CSVW_METADATA_FILES 		:= $(wildcard remote/*-metadata.json)
BULK_TTL_FILES    			:= $(CSVW_METADATA_FILES:remote/%-metadata.json=out/bulk/%.ttl)
BULK_JSON_LD_FILES 			:= $(CSVW_METADATA_FILES:remote/%-metadata.json=out/bulk/%.json)

docker-pull:
	@echo "=============================== Pulling latest required docker images. ==============================="
	@docker pull $(CSVW_CHECK_DOCKER)
	@docker pull $(CSV2RDF_DOCKER)
	@docker pull $(JENA_CLI_DOCKER)
	@echo "" ; 

output-directories:
	@mkdir -p out/bulk

validate: $(CSVW_METADATA_FILES)
	@for file in $(CSVW_METADATA_FILES) ; do \
		echo "=============================== Validating $$file ===============================" ; \
		$(CSVW_CHECK) "$$file" ; \
		echo "" ; \
	done

out/bulk/%.ttl: remote/%-metadata.json
	@echo "=============================== Converting $< to ttl $@ ===============================" ;
	@$(CSV2RDF) "$<" -o "$@";
	@echo "" ;

out/bulk/%.json: out/bulk/%.ttl
	@echo "=============================== Converting $< to JSON-LD $@ ===============================" ;
	@$(RIOT) --syntax ttl --out json-ld "$<" > "$@";
	@echo "";

bulk-ttl: $(BULK_TTL_FILES)

bulk-jsonld: $(BULK_JSON_LD_FILES)

split: $(BULK_TTL_FILES)
	@$(MAKE) -f split/Makefile jsonld

init:
	@$(MAKE) output-directories docker-pull 
	@$(MAKE) -f split/Makefile init

all:
	@$(MAKE) init validate bulk-jsonld split

clean:
	@$(MAKE) -f split/Makefile clean
	@rm -rf out


.DEFAULT_GOAL := all