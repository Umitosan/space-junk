import { Pipe, PipeTransform } from '@angular/core';
import { Satellite } from './satellite.model';

@Pipe({
  name: 'purpose',
  pure: true
})

export class PurposePipe implements PipeTransform {

  transform(input: Satellite[], desiredFilter){
    var output: Satellite[] = [];
    if (input !== null) {
          if (desiredFilter === "ALL") {
            output = input;
          } else {
            for (let i = 0; i < input.length; i++) {
              if (input[i].Purpose === desiredFilter) {
                output.push(input[i]);
              }
            }
          }
    }
    return output;
  }

}
