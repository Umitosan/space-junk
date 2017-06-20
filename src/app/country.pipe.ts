import { Pipe, PipeTransform } from '@angular/core';
import { Satellite } from './satellite.model';

@Pipe({
  name: 'country',
  pure: true
})
export class CountryPipe implements PipeTransform {

  transform(input: Satellite[], desiredFilter){
    console.log("pipe ran");

    var output: Satellite[] = [];
    if (input !== null) {
      console.log("filter:" ,desiredFilter);

      if(desiredFilter === 'Multinational') {
        for (var i = 0; i < input.length; i++) {
          if (input[i].CountryOperatorOwner === 'Multinational' ) {
            output.push(input[i]);
          }
        }
      }
    }
    return output;
  }

}
